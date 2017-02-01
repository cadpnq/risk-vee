; RVeL - risk-vee-lisp
; Nicky Nickell - 2017

; This is the first lisp I have written in assembly. Everything is
; intentionally as dumb as possible for simplicity... to the extent that
; it is only a toy lisp. No macros. No read macros. No strings. No
; floats. No TCO.
; BUT! It will have garbage collection and lexical scoping. I haven't
; implemented a garbage collector before and this interpreter is mostly
; an excuse to do so.
; If I ever get around to doing risk-vee in hardware everything here
; will need reworked into a more featureful lisp.

  j init

; ======================================================================
; =                        symbolic constants                          =
; ======================================================================

.constant OutPort 0xFF000000
.constant InPort 0xFF000001
.constant CharReady 0xFF000002
  
; each cell will be 4 words and will be laid out as follows:
; note that the last halfword is omitted as it is the same for every
; type. one byte showing if a cell has been migrated and a type byte
; [ data(112) ] [ migrated(8) ] [ type(8) ]

; PAIR:
; [ car(32) ] [ cdr(32) ] [ null(48) ]

; INT:
; if we were feeling crazy we could implement 112-bit math with the
; extra space
; [ int(32) ] [ null(80) ]

; ID:
; ids can be up to 27 characters long
; [ id(112) ]

; So much unused space in each cell might seem wasteful, but we have
; a lot of memory to play with. The logisim implementation has 16mb of
; RAM and the physical version will have as much RAM as I feel like
; soldering.

; My next lisp (lets face it, you always end up writing another one)
; will most likely pack the type and gc info into the top bits of the 
; car and cdr to save space.

; constants for indexing into a cell
.constant CAR 0
.constant CDR 4
.constant MIGRATED 14
.constant TYPE 15

; information about our heap. for now i'm just sticking it 1mb into the
; address space and making it 1mb long. we're using stop-and-copy, so
; that that gets split in half meaning we have 131072 4 word cells to 
; play with.
; Picking 1mb was arbitrary. If needed there is a *lot* more
.constant heap_start 0x100000
.constant heap_split 0x180000

; cell type constants
.constant TYPE_PAIR 0
.constant TYPE_INT 1
.constant TYPE_ID 2
.constant TYPE_FUNCTION 3

; ======================================================================
; =                           variables                                =
; ======================================================================

to_space:
  .word 0
from_space:
  .word 0
  
next:
  .word 0
scan:
  .word 0

oblist:
  .word 0
global:
  .word 0
nil:
  .word 0
t:
  .word 0

init:
  li sp, 0x00300000 ; initialize stack pointer

  li t0, heap_start
  sw zero, t0, 'from_space
  sw zero, t0, 'next
  
  li t0, heap_split
  sw zero, t0, 'to_space
  
  ; set the oblist up. at first it is a pair with a car and cdr of nil
  jal ra, new_pair
  mv s0, a0

  li a0, 'nil_str
  jal ra, new_id
  mv s1, a0

  sw zero, a0, 'nil
  
  sw s0, s1, CAR
  sw s0, s1, CDR
  ; with that done we can use intern for everything else

  ; a null word hangs risk-vee. should define it as HCF or HLT
  .word 0
    
  ; TODO:
  ; initialize oblist and global
  ; intern stuff
  ; put builtins into global env
  ; jump to repl

; set the type of the next cell, increment next, and return new cell
new_cell:
  lw t0, zero, 'next
  sb t0, a0, TYPE
  mv a0, t0
  addi t0, a0, 16
  sw zero, t0, 'next
  ret

new_pair:
  sw sp, ra, -4
  addi sp, sp -4
  
  li a0, TYPE_PAIR
  jal ra, new_cell
  
  
  lw ra, sp, 0
  addi sp, sp, 4
  ret
  
new_int:
  sw sp, ra, -4
  addi sp, sp -4
  
  li a0, TYPE_INT
  jal ra, new_cell
  
  lw ra, sp, 0
  addi sp, sp, 4
  ret
  
new_id:
  sw sp, ra, -4
  sw sp, s0, -8
  sw sp, s1, -12
  addi sp, sp -12
  
  ; get a new cell
  mv s0, a0
  li a0, TYPE_ID
  jal ra, new_cell
  mv s1, a0
  
  ; set the name of the id
  mv a1, a0
  mv a0, s0
  jal ra, strcpy
  
  mv a0, s1
  
  lw s1, sp, 0
  lw s0, sp, 4
  lw ra, sp, 8
  addi sp, sp, 12
  ret
  
  
gc:
  sw sp, ra, -4
  sw sp, s0, -8
  addi sp, sp -8
  
  ; set the next pointer to the start of the to space
  lw t0, zero, 'to_space
  sw zero, t0, 'scan
  sw zero, t0, 'next
  
  ; migrate our root objects
  lw a0, zero, 'oblist
  jal ra, migrate
  sw zero, a0, 'oblist
;  lw a0, zero, 'global
;  jal ra, migrate
;  sw zero, a0, 'global
  
gc_loop:
  ; if we're looking at a pair we need to update it
  lw t0, zero, 'scan
  lb t1, t0, TYPE
  addi t2, zero, TYPE_PAIR
  bne t1, t2, gc_next_cell
  
  ; stick a pointer to the cell in s0
  mv s0, t0
  
  ; migrate the CAR and CDR then update our cell
  lw a0, s0, CAR
  jal ra, migrate
  sw s0, a0, CAR
  
  lw a0, s0, CDR
  jal ra, migrate
  sw, s0, a0, CDR

gc_next_cell:  
  ; when scan meets next we have processed everything
  lw t0, zero, 'next
  lw t1, zero, 'scan
  bne t0, t1, gc_loop
  
  ; swap from_space and to_space
  lw t0, zero, 'to_space
  lw t1, zero, 'from_space
  sw t0, zero, 'from_space
  sw t1, zero, 'to_space

  lw s0, sp, 0
  lw ra, sp, 4
  addi sp, sp, 8
  ret
  
migrate:
  ; if cell hasn't been migrated already we branch to the migration code
  ; otherwise we return the value of the CAR - which we set to the new 
  ; address on migration
  lb t0, a0, MIGRATED
  beqz t0, do_migrate
  
  lw a0, a0, CAR
  ret
  
do_migrate:
  ; copy cell from oldspace to newspace
  lw t0, zero, 'next
  lw t1, a0, 0
  sw t0, t1, 0
  lw t1, a0, 1
  sw t0, t1, 1
  lw t1, a0, 2
  sw t0, t1, 2
  lw t1, a0, 3
  sw t0, t1, 3
  
  ; set CAR to new object and mark as migrated
  sw a0, t0, CAR
  li t3, 1
  sb a0, t3, MIGRATED
  
  addi t0, t0, 4
  sw zero, t0, 'next
  
  ret
  
; given a string, scan the oblist looking for a matching ID. if one isnt
; found make one add it to the oblist. in either case, an ID matching 
; the input string is returned
intern:
  ret

; prints a cell
; a0 is the cell
print:
  sw sp, ra, -4
  addi sp, sp -4
  
  ; load the type of the cell
  lb t0, a0, TYPE
  
  addi t1, zero, TYPE_PAIR
  beq t0, t1, print_pair
  addi t1, zero, TYPE_INT
  beq t0, t1, print_int
  addi t1, zero, TYPE_ID
  beq t0, t1, print_id
  addi t1, zero, TYPE_FUNCTION
  beq t0, t1, print_function
  j print_end
  
print_pair:
  j print_end
print_int:
  j print_end
print_id:
  jal ra, out_string
  j print_end
print_function:

print_end:
  lb sp, ra, 0
  addi sp, sp, 4
  ret


; copy string at a0 to a1  
strcpy:
  lb t0, a0, 0
  beqz t0, strcpy_end
  sb a1, t0, 0
  addi a0, a0, 1
  addi a1, a1, 1
  beq zero, zero, strcpy
  
strcpy_end:
  ret
  
strcmp:
  ret
  
  
; Output a character
; a0 is character
out_char:
  li t0, OutPort
  sb t0, a0, 0
  ret

; Output a hexadecimal value
; a0 is value
; a1 is nibble width
out_hex:
  li t3, 'HexTable
  mv t5, a0

  sw sp, ra, -4   ; save our return address
  addi sp, sp, -4

out_hex_character:
  addi a1, a1, -1 ; decrement i
  slli t2, a1, 2  ; i = i << 2
  
  srl t4, t5, t2  ; d = a >> i
  andi t4, t4, 0xF ; d = d & 0xf
  add t4, t4, t3   ; a0 = d + hextable
  
  lb a0, t4, 0
  jal ra, out_char

  bne a1, zero, out_hex_character

out_hex_end:
  lw ra, sp, 0
  addi sp, sp, 4
  ret
  
; Output a string
; a0 is the starting address of the string
out_string:
  sw sp, ra, -4   ; save our return address
  addi sp, sp, -4
  mv t1, a0
  
out_string_charloop:
  lb t2, t1, 0
  beqz t2, out_string_end
  mv a0, t2
  jal ra, out_char
  addi t1, t1, 1
  j out_string_charloop
  
out_string_end:
  lw ra, sp, 0
  addi sp, sp, 4
  ret
  
; Print a newline to the console
newline:
  sw sp, ra, -4
  addi sp, sp -4
  
  li a0, 10
  jal ra, out_char
  
  lw ra, sp, 0
  addi sp, sp, 4
  ret

; ======================================================================
; =                             constants                              =
; ======================================================================
HexTable:
  .stringu "0123456789ABCDEF"
  
nil_str:
  .string "NIL"
t_str:
  .string "T"
oblist_str:
  .string "OBLIST"
