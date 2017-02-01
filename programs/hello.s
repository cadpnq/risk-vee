  li sp, 0x000ff000 ; initialize stack pointer
  li s0, 'HelloWorld

top:
  mv a0, s0
  jal ra, out_string
  j top

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


; Output a character
; a0 is character
out_char:
  li t0, 0xff000000
  sb t0, a0, 0
  ret
  
HelloWorld:
  .string "Hello World!"
