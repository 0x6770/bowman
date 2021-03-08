/*
 * "Hello World" example.
 *
 * This example prints 'Hello from Nios II' to the STDOUT stream. It runs on
 * the Nios II 'standard', 'full_featured', 'fast', and 'low_cost' example
 * designs. It runs with or without the MicroC/OS-II RTOS and requires a STDOUT
 * device in your system's hardware.
 * The memory footprint of this hosted application is ~69 kbytes by default
 * using the standard reference design.
 *
 * For a reduced footprint version of this template, and an explanation of how
 * to reduce the memory footprint for a given application, see the
 * "small_hello_world" template.
 *
 */

#include "alt_types.h"
#include "altera_avalon_timer.h"
#include "altera_avalon_timer_regs.h"
#include "altera_up_avalon_accelerometer_spi.h"
#include "sys/alt_irq.h"
#include "sys/times.h"
#include "system.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#include "fir_lpf.h"

#define clear() printf("\033[H\033[J") // clear screen
#define SECOND 1000

float coeff_float[] = {
    -0.000322013353359136, -0.000936489485658197, -0.00167295402434975,
    -0.00192637230550001,  -0.000998309061169511, 0.00129706710497499,
    0.00407388693015995,   0.00545052793285036,   0.00357439223389698,
    -0.00179536612799031,  -0.00823863626606655,  -0.0113139071690476,
    -0.00713976047413447,  0.00431850973405349,   0.0175604378180361,
    0.0233960359246219,    0.0142750951957138,    -0.00953138065322323,
    -0.0369471450398869,   -0.0492772493275829,   -0.0291492467609076,
    0.0290440767662304,    0.113225780516144,     0.196473028431238,
    0.248174893650406,     0.248174893650406,     0.196473028431238,
    0.113225780516144,     0.0290440767662304,    -0.0291492467609076,
    -0.0492772493275829,   -0.0369471450398869,   -0.00953138065322323,
    0.0142750951957138,    0.0233960359246219,    0.0175604378180361,
    0.00431850973405349,   -0.00713976047413447,  -0.0113139071690476,
    -0.00823863626606655,  -0.00179536612799031,  0.00357439223389698,
    0.00545052793285036,   0.00407388693015995,   0.00129706710497499,
    -0.000998309061169511, -0.00192637230550001,  -0.00167295402434975,
    -0.000936489485658197, -0.000322013353359136};

int main() {
  FILE *fp;
  alt_32 x_read;
  int prompt = -1;
  int mode = 0;
  int length = sizeof(coeff_float) / sizeof(coeff_float[0]);
  int buff_fixed[length];
  int coeff_fixed[length];
  int k = float2fixed(0.125); // kalman gain
  int r = float2fixed(32);    // measurement noise covariance
  int p = float2fixed(1023);  // estimation error covariance
  int q = float2fixed(0.125); // process noise covariance
  int x_hat = float2fixed(1); // estimation of x_read

  memset(buff_fixed, 0, length); // initialise buff_fixed to [0...0]
  for (int i = 0; i < length; i++) {
    coeff_fixed[i] = float2fixed(coeff_float[i]);
  }

  clear();
  printf("Running..\n");
  printf("Negative input would stop this program.\n");
  printf("k: %d, r: %d, p: %d, q: %d, x_hat: %d\n", k, r, p, q, x_hat);

  alt_up_accelerometer_spi_dev *acc_dev;
  acc_dev = alt_up_accelerometer_spi_open_dev("/dev/accelerometer_spi");
  if (acc_dev == NULL) {
    // if return 1, check if the spi ip name is "accelerometer_spi"
    return 1;
  }

  // create file pointer to jtag_uart port
  fp = fopen("/dev/jtag_uart", "r+");
  if (fp) {
    while (1) { // stop when 0 is sent
      fscanf(fp, "%d,", &prompt);

      if (prompt < 0) { // stop when receive negative input
        // the 0x4 character is used the send ^D up to the host side
        // nios2-terminal so that it exits and the python program can
        // continue
        fprintf(fp, "Received negative input %d.\n", prompt);
        fprintf(fp, "Closing the JTAG UART file handle.\n %c", 0x4);
        fclose(fp);
        return 0;
      }

      mode = prompt ? 1 : 0;

      printf("mode: %d\n", mode);
      // accept the character that has been sent down
      clock_t t0 = clock(0); // initial time
      clock_t t = clock(0);
      int td;

      while ((td = t - t0) < 10 * SECOND) { // interval of 1 second
        alt_up_accelerometer_spi_read_x_axis(acc_dev, &x_read);
        int y = fir_fixed(length, x_read, coeff_fixed, buff_fixed);
        int z = kalman_fixed_update(&k, &r, &p, &q, &x_hat, x_read);
        /*fprintf(fp, "mode, %5d, time, %5ld, x, %5d, y, %5d, kf, %5d\n",
         * mode,*/
        /*td, x_read, y, z);*/
        fprintf(fp, "time, %5ld, x, %5d, y, %5d, kf, %5d\n", td, x_read, y, z);
        t = clock(0);
      }
      if (ferror(fp)) {
        clearerr(fp);
      }
    }
  }
  printf("Complete\n");

  return 0;
}
