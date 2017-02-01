  .constant OutPort 0xFF000000
  .constant InPort 0xFF000001
  .constant CharReady 0xFF000002

  li sp, 0x000ff000 ; initialize stack pointer
  
  li s0, 1
top:
  add s3, s0, s1
  mv a0, s0
  mv s1, s0
  mv s0, s3

  li a1, 8
  jal ra, out_hex
  jal ra, newline
  j top

; Print a newline to the console
newline:
  sw sp, ra, -4
  addi sp, sp -4
  
  li a0, 10
  jal ra, out_char
  
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

; Output a hexadecimal value
; a0 is value
; a1 is bitwidth
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

; Output a character
; a0 is character
out_char:
  li t0, OutPort
  sb t0, a0, 0
  ret
  
  
; Constants
HexTable:
  .stringu "0123456789ABCDEF"
