
//=======================================================
//  This code is generated by Terasic System Builder
//=======================================================

module bowman_de10_lite(

  //////////// CLOCK //////////
  input                   ADC_CLK_10,
  input                   MAX10_CLK1_50,
  input                   MAX10_CLK2_50,

  //////////// SDRAM //////////
  output        [12:0]    DRAM_ADDR,
  output         [1:0]    DRAM_BA,
  output                  DRAM_CAS_N,
  output                  DRAM_CKE,
  output                  DRAM_CLK,
  output                  DRAM_CS_N,
  inout         [15:0]    DRAM_DQ,
  output                  DRAM_LDQM,
  output                  DRAM_RAS_N,
  output                  DRAM_UDQM,
  output                  DRAM_WE_N,

  //////////// SEG7 //////////
  output         [7:0]    HEX0,
  output         [7:0]    HEX1,
  output         [7:0]    HEX2,
  output         [7:0]    HEX3,
  output         [7:0]    HEX4,
  output         [7:0]    HEX5,

  //////////// KEY //////////
  input          [1:0]    KEY,

  //////////// LED //////////
  output         [9:0]    LEDR,

  //////////// SW //////////
  input          [9:0]    SW,

  //////////// Accelerometer //////////
  output                  GSENSOR_CS_N,
  input          [2:1]    GSENSOR_INT,
  output                  GSENSOR_SCLK,
  inout                   GSENSOR_SDI,
  inout                   GSENSOR_SDO
);



//=======================================================
//  REG/WIRE declarations
//=======================================================




//=======================================================
//  Structural coding
//=======================================================

bowman u0 (
  .accelerometer_spi_external_interface_I2C_SDAT      (GSENSOR_SDI),            // accelerometer_spi_external_interface.I2C_SDAT
  .accelerometer_spi_external_interface_I2C_SCLK      (GSENSOR_SCLK),           //                                     .I2C_SCLK
  .accelerometer_spi_external_interface_G_SENSOR_CS_N (GSENSOR_CS_N),           //                                     .G_SENSOR_CS_N
  .accelerometer_spi_external_interface_G_SENSOR_INT  (GSENSOR_INT[1]),         //                                     .G_SENSOR_INT
  .clk_clk                                            (MAX10_CLK2_50),          //                                  clk.clk
  .led_external_connection_export                     (LEDR[9:0]),              //              led_external_connection.export
  .reset_reset_n                                      (1'b1),                   //                                reset.reset_n
  .sdram_wire_addr                                    (DRAM_ADDR),              //                           sdram_wire.addr
  .sdram_wire_ba                                      (DRAM_BA),                //                                     .ba
  .sdram_wire_cas_n                                   (DRAM_CAS_N),             //                                     .cas_n
  .sdram_wire_cke                                     (DRAM_CKE),               //                                     .cke
  .sdram_wire_cs_n                                    (DRAM_CS_N),              //                                     .cs_n
  .sdram_wire_dq                                      (DRAM_DQ),                //                                     .dq
  .sdram_wire_dqm                                     ({DRAM_UDQM, DRAM_LDQM}), //                                     .dqm
  .sdram_wire_ras_n                                   (DRAM_RAS_N),             //                                     .ras_n
  .sdram_wire_we_n                                    (DRAM_WE_N),              //                                     .we_n
  .clk_sdram_clk                                      (DRAM_CLK),               //                            clk_sdram.clk
  .altpll_0_areset_conduit_export                     (),                       //              altpll_0_areset_conduit.export
  .altpll_0_locked_conduit_export                     (),                        //              altpll_0_locked_conduit.export
  
  .button_external_connection_export                  (KEY[1:0]),                  //           button_external_connection.export
  .hex_5_external_connection_export                   (HEX5),                   //            hex_5_external_connection.export
  .hex_4_external_connection_export                   (HEX4),                   //            hex_4_external_connection.export
  .hex_3_external_connection_export                   (HEX3),                   //            hex_3_external_connection.export
  .hex_2_external_connection_export                   (HEX2),                   //            hex_2_external_connection.export
  .hex_1_external_connection_export                   (HEX1),                   //            hex_1_external_connection.export
  .hex_0_external_connection_export                   (HEX0),                   //            hex_0_external_connection.export
  .switch_external_connection_export                  (SW[9:0])                   //           switch_external_connection.export

  
 );


endmodule