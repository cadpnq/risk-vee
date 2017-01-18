function parseBin(b) {
  return parseInt(b.replace(new RegExp("-| ", "g"),""), 2);
}

function microinstruction(masks) {
	var ret = 0;
	for(var i in masks) {
		ret |= masks[i];
	}
	return (ret >>> 0).toString(16);
}

function entry(microinstructions) {
  ret = "";
  for(var i = 0; i < 16; i++) {
    if(microinstructions[i]) {
      ret += microinstruction(microinstructions[i]);
    } else {
      ret += "0";
    }
    ret += " ";
  }
  return ret;
}

// this naively recomputes things over and over, but speed isn't a factor since 
// this is run-once code. screw it
function microcode(instructions) {
  for(var i = 0; i < 2048; i++) {
    for(var j in instructions) {
      var inst = instructions[j];
      var mask = parseBin(inst[0].replace(new RegExp("0", "g"), "1")
                                 .replace(new RegExp("X", "g"), "0"));
      var opcode = parseBin(inst[0].replace(new RegExp("X", "g"), "0"));
      if((i & mask) == opcode) {
        console.log(entry(inst[1]));
        break;
      }
    }
  }
}

// control line masks
register_write =             parseBin("0000-0000 0000-0000 0000-0000 0000-0010");
register_read =              parseBin("0000-0000 0000-0000 0000-0000 0000-0100");
//pc_write(3)                0000-0000 0000-0000 0000-0000 00xx-x000
pc_write_never =             parseBin("0000-0000 0000-0000 0000-0000 0000-0000");
pc_write_always =            parseBin("0000-0000 0000-0000 0000-0000 0000-1000");
pc_write_eq =                parseBin("0000-0000 0000-0000 0000-0000 0001-0000");
pc_write_lt =                parseBin("0000-0000 0000-0000 0000-0000 0001-1000");
pc_write_ltu =               parseBin("0000-0000 0000-0000 0000-0000 0010-0000");
pc_write_ne =                parseBin("0000-0000 0000-0000 0000-0000 0010-1000");
pc_write_ge =                parseBin("0000-0000 0000-0000 0000-0000 0011-0000");
pc_write_geu =               parseBin("0000-0000 0000-0000 0000-0000 0011-1000");
pc_read =                    parseBin("0000-0000 0000-0000 0000-0000 0100-0000");
compare_latch =              parseBin("0000-0000 0000-0000 0000-0000 1000-0000");
alu_a_write =                parseBin("0000-0000 0000-0000 0000-0001 0000-0000");
alu_b_write =                parseBin("0000-0000 0000-0000 0000-0010 0000-0000");
alu_o_read =                 parseBin("0000-0000 0000-0000 0000-0100 0000-0000");
//alu_select(4)              0000-0000 0000-0000 0xxx-x000 0000-0000
alu_select_add4 =            parseBin("0000-0000 0000-0000 0000-0000 0000-0000");
alu_select_add =             parseBin("0000-0000 0000-0000 0000-1000 0000-0000");
alu_select_sub =             parseBin("0000-0000 0000-0000 0001-0000 0000-0000");
alu_select_or =              parseBin("0000-0000 0000-0000 0001-1000 0000-0000");
alu_select_and =             parseBin("0000-0000 0000-0000 0010-0000 0000-0000");
alu_select_xor =             parseBin("0000-0000 0000-0000 0010-1000 0000-0000");
alu_select_sll =             parseBin("0000-0000 0000-0000 0011-0000 0000-0000");
alu_select_slr =             parseBin("0000-0000 0000-0000 0011-1000 0000-0000");
alu_select_sar =             parseBin("0000-0000 0000-0000 0100-0000 0000-0000");
alu_select_slt =             parseBin("0000-0000 0000-0000 0100-1000 0000-0000");
alu_select_sltu =            parseBin("0000-0000 0000-0000 0101-0000 0000-0000");
alu_select_extb =            parseBin("0000-0000 0000-0000 0110-0000 0000-0000");
alu_select_exth =            parseBin("0000-0000 0000-0000 0111-0000 0000-0000");
mem_data_read =              parseBin("0000-0000 0000-0000 1000-0000 0000-0000");
mem_data_write =             parseBin("0000-0000 0000-0001 0000-0000 0000-0000");
mem_enable =                 parseBin("0000-0000 0000-0010 0000-0000 0000-0000");
mem_rw =                     parseBin("0000-0000 0000-0100 0000-0000 0000-0000");
mem_address_write =          parseBin("0000-0000 0000-1000 0000-0000 0000-0000");
mem_address_inc =            parseBin("0000-0000 0001-0000 0000-0000 0000-0000");
ir_write =                   parseBin("0000-0000 0010-0000 0000-0000 0000-0000");
//immediate_select(3)        0000-000x xx00-0000 0000-0000 0000-0000
immediate_select_I =         parseBin("0000-0000 0000-0000 0000-0000 0000-0000");
immediate_select_S =         parseBin("0000-0000 0100-0000 0000-0000 0000-0000");
immediate_select_B =         parseBin("0000-0000 1000-0000 0000-0000 0000-0000");
immediate_select_U =         parseBin("0000-0000 1100-0000 0000-0000 0000-0000");
immediate_select_J =         parseBin("0000-0001 0000-0000 0000-0000 0000-0000");
immediate_enable =           parseBin("0000-0010 0000-0000 0000-0000 0000-0000");
memory_latch_enable =        parseBin("0000-0100 0000-0000 0000-0000 0000-0000");
//memory_latch_select(3)     00xx-x000 0000-0000 0000-0000 0000-0000
memory_latch_select_dr =     parseBin("0000-0000 0000-0000 0000-0000 0000-0000");
memory_latch_select_cr =     parseBin("0000-1000 0000-0000 0000-0000 0000-0000");
memory_latch_select_br =     parseBin("0001-0000 0000-0000 0000-0000 0000-0000");
memory_latch_select_ar =     parseBin("0001-1000 0000-0000 0000-0000 0000-0000");
memory_latch_select_dw =     parseBin("0010-0000 0000-0000 0000-0000 0000-0000");
memory_latch_select_cw =     parseBin("0010-1000 0000-0000 0000-0000 0000-0000");
memory_latch_select_bw =     parseBin("0011-0000 0000-0000 0000-0000 0000-0000");
memory_latch_select_aw =     parseBin("0011-1000 0000-0000 0000-0000 0000-0000");
//register_select_select(2) xx00-0000 0000-0000 0000-0000 0000-0000
register_select_select_rs1 = parseBin("0000-0000 0000-0000 0000-0000 0000-0000");
register_select_select_rs2 = parseBin("0100-0000 0000-0000 0000-0000 0000-0000");
register_select_select_rsd = parseBin("1000-0000 0000-0000 0000-0000 0000-0000");
register_select_select_r0 =  parseBin("1100-0000 0000-0000 0000-0000 0000-0000");
    
// opcodes. X means a "don't care"
LOAD   = "00000000000"
LUI    = "XXXX0110111"
AUIPC  = "XXXX0010111"
JAL    = "XXXX1101111"
JALR   = "X0001100111"
BEQ    = "X0001100011"
BNE    = "X0011100011"
BLT    = "X1001100011"
BGE    = "X1011100011"
BLTU   = "X1101100011"
BGEU   = "X1111100011"
LB     = "X0000000011"
LH     = "X0010000011"
LW     = "X0100000011"
LBU    = "X1000000011"
LHU    = "X1010000011"
SB     = "X0000100011"
SH     = "X0010100011"
SW     = "X0100100011"
ADDI   = "X0000010011"
SLTI   = "X0100010011"
SLTIU  = "X0110010011"
XORI   = "X1000010011"
ORI    = "X1100010011"
ANDI   = "X1110010011"
SLLI   = "00010010011"
SRLI   = "01010010011"
SRAI   = "11010010011"
ADD    = "00000110011"
SUB    = "10000110011"
SLL    = "00010110011"
SLT    = "00100110011"
SLTU   = "00110110011"
XOR    = "01000110011"
SRL    = "01010110011"
SRA    = "11010110011"
OR     = "01100110011"
AND    = "01110110011"
NOP    = "XXXXXXXXXXX"

next_0 = [pc_read, alu_a_write];
next_1 = [alu_o_read, pc_write_always, alu_select_add4];
next_2 = [register_read, register_select_select_r0, ir_write];

function branch_instruction(condition) {
  return [[register_read, register_select_select_rs1, alu_a_write],
          [register_read, register_select_select_rs2, alu_b_write],
          [pc_read, alu_a_write, compare_latch],
          [alu_o_read, pc_write_always, alu_select_add4],
          [immediate_enable, immediate_select_B, alu_b_write],
          [alu_o_read, condition, alu_select_add],
          next_2
         ];
}

function register_immediate_instruction(operation) {
  return [[register_read, register_select_select_rs1, alu_a_write],
          [immediate_enable, immediate_select_I, alu_b_write],
          [alu_o_read, register_write, register_select_select_rsd, operation],
          next_0, next_1, next_2
         ];
} 

function register_register_instruction(operation) {
  return [[register_read, register_select_select_rs1, alu_a_write],
          [register_read, register_select_select_rs2, alu_b_write],
          [alu_o_read, register_write, register_select_select_rsd, operation],
          next_0, next_1, next_2
         ];
} 

console.log("v2.0 raw");

microcode([
  [LOAD, [[pc_read, mem_address_write],
          [mem_enable, mem_rw, memory_latch_enable, memory_latch_select_aw, mem_address_inc],
          [mem_enable, mem_rw, memory_latch_enable, memory_latch_select_bw, mem_address_inc],
          [mem_enable, mem_rw, memory_latch_enable, memory_latch_select_cw, mem_address_inc],
          [mem_enable, mem_rw, memory_latch_enable, memory_latch_select_dw, mem_address_inc],
          [mem_data_read, ir_write]
         ]
  ],
  [LUI, [[immediate_enable, immediate_select_U, register_write, register_select_select_rsd],
         next_0, next_1, next_2
        ]
  ],
  [AUIPC, [[immediate_enable, immediate_select_U, alu_a_write],
          [pc_read, alu_b_write],
          [alu_o_read, alu_select_add, register_select_select_rsd],
          next_0, next_1, next_2
         ]
  ],
  [JAL, [[pc_read, alu_a_write],
         [immediate_enable, immediate_select_J, alu_b_write],
         [alu_o_read, alu_select_add4, register_write, register_select_select_rsd],
         [alu_o_read, alu_select_add, pc_write_always],
         next_2
        ]
  ],
  [JALR, [[pc_read, alu_a_write],
          [alu_o_read, alu_select_add4, register_write, register_select_select_rsd],
          [register_read, register_select_select_rs1, alu_a_write],
          [immediate_enable, immediate_select_I, alu_b_write],
          [alu_o_read, alu_select_add, pc_write_always],
          next_2
         ]
  ],
  [LB, [[register_read, register_select_select_rs1, alu_a_write],
        [immediate_enable, immediate_select_I, alu_b_write],
        [alu_o_read, mem_address_write, alu_select_add],
        [mem_enable, mem_rw, memory_latch_enable, memory_latch_select_aw],
        [mem_data_read, alu_a_write],
        [alu_o_read, alu_select_extb, register_write, register_select_select_rsd],
        next_0, next_1, next_2
       ]
  ],
  [LH, [[register_read, register_select_select_rs1, alu_a_write],
        [immediate_enable, immediate_select_I, alu_b_write],
        [alu_o_read, mem_address_write, alu_select_add],
        [mem_enable, mem_rw, memory_latch_enable, memory_latch_select_aw, mem_address_inc],
        [mem_enable, mem_rw, memory_latch_enable, memory_latch_select_bw, mem_address_inc],
        [mem_data_read, alu_a_write],
        [alu_o_read, alu_select_exth, register_write, register_select_select_rsd],
        next_0, next_1, next_2
       ]
  ],
  [LW, [[register_read, register_select_select_rs1, alu_a_write],
        [immediate_enable, immediate_select_I, alu_b_write],
        [alu_o_read, mem_address_write, alu_select_add],
        [mem_enable, mem_rw, memory_latch_enable, memory_latch_select_aw, mem_address_inc],
        [mem_enable, mem_rw, memory_latch_enable, memory_latch_select_bw, mem_address_inc],
        [mem_enable, mem_rw, memory_latch_enable, memory_latch_select_cw, mem_address_inc],
        [mem_enable, mem_rw, memory_latch_enable, memory_latch_select_dw],
        [mem_data_read, register_write, register_select_select_rsd],
        next_0, next_1, next_2
       ]
  ],
  [LBU, [[register_read, register_select_select_rs1, alu_a_write],
        [immediate_enable, immediate_select_I, alu_b_write],
        [alu_o_read, mem_address_write, alu_select_add],
        [mem_enable, mem_rw, memory_latch_enable, memory_latch_select_aw],
        [mem_data_read, register_write, register_select_select_rsd],
        next_0, next_1, next_2
       ]
  ],
  [LHU, [[register_read, register_select_select_rs1, alu_a_write],
        [immediate_enable, immediate_select_I, alu_b_write],
        [alu_o_read, mem_address_write, alu_select_add],
        [mem_enable, mem_rw, memory_latch_enable, memory_latch_select_aw, mem_address_inc],
        [mem_enable, mem_rw, memory_latch_enable, memory_latch_select_bw, mem_address_inc],
        [mem_data_read, register_write, register_select_select_rsd],
        next_0, next_1, next_2
       ]
  ],
  [SB, [[register_read, register_select_select_rs1, alu_a_write],
        [immediate_enable, immediate_select_S, alu_b_write],
        [alu_o_read, mem_address_write, alu_select_add],
        [register_read, register_select_select_rs2, mem_data_write],
        [mem_enable, memory_latch_enable, memory_latch_select_ar],
        next_0, next_1, next_2
       ]
  ],
  [SH, [[register_read, register_select_select_rs1, alu_a_write],
        [immediate_enable, immediate_select_S, alu_b_write],
        [alu_o_read, mem_address_write, alu_select_add],
        [register_read, register_select_select_rs2, mem_data_write],
        [mem_enable, memory_latch_enable, memory_latch_select_ar, mem_address_inc],
        [mem_enable, memory_latch_enable, memory_latch_select_br, mem_address_inc],
        next_0, next_1, next_2
       ]
  ],
  [SW, [[register_read, register_select_select_rs1, alu_a_write],
        [immediate_enable, immediate_select_S, alu_b_write],
        [alu_o_read, mem_address_write, alu_select_add],
        [register_read, register_select_select_rs2, mem_data_write],
        [mem_enable, memory_latch_enable, memory_latch_select_ar, mem_address_inc],
        [mem_enable, memory_latch_enable, memory_latch_select_br, mem_address_inc],
        [mem_enable, memory_latch_enable, memory_latch_select_cr, mem_address_inc],
        [mem_enable, memory_latch_enable, memory_latch_select_dr],
        next_0, next_1, next_2
       ]
  ],
  
  [BEQ, branch_instruction(pc_write_eq)],
  [BNE, branch_instruction(pc_write_ne)],
  [BLT, branch_instruction(pc_write_lt)],
  [BGE, branch_instruction(pc_write_ge)],
  [BLTU, branch_instruction(pc_write_ltu)],
  [BGEU, branch_instruction(pc_write_geu)],
  
  [ADDI, register_immediate_instruction(alu_select_add)],
  [SLTI, register_immediate_instruction(alu_select_slt)],
  [SLTIU, register_immediate_instruction(alu_select_sltu)],
  [XORI, register_immediate_instruction(alu_select_xor)],
  [ORI, register_immediate_instruction(alu_select_or)],
  [ANDI, register_immediate_instruction(alu_select_and)],
  [SLLI, register_immediate_instruction(alu_select_sll)],
  [SRLI, register_immediate_instruction(alu_select_slr)],
  [SRAI, register_immediate_instruction(alu_select_sar)],
  
  [ADD, register_register_instruction(alu_select_add)],
  [SUB, register_register_instruction(alu_select_sub)],
  [SLL, register_register_instruction(alu_select_sll)],
  [SLT, register_register_instruction(alu_select_slt)],
  [SLTU, register_register_instruction(alu_select_sltu)],
  [XOR, register_register_instruction(alu_select_xor)],
  [SRL, register_register_instruction(alu_select_slr)],
  [SRA, register_register_instruction(alu_select_sar)],
  [OR, register_register_instruction(alu_select_or)],
  [AND, register_register_instruction(alu_select_and)],
  
  [NOP, [next_0, next_1, next_2
        ]
  ]
]);

