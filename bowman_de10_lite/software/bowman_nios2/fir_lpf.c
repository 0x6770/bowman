#include "fir_lpf.h"

/* Use 16.16 Fixed Point Representation */
int float2fixed(float n) { return round(n * (1 << FIXED_BIT)); }

//////////////////////////////////////////////////
//  FIR Low Pass Filter
//////////////////////////////////////////////////

// Implementation of a Finite Impluse Filter using Fixed-Point
// y[n] = \sum_{k = 0} ^
// {M} {b[k] * x[n - k]}

int fir_fixed(int length, int input, int *coeff, int *buff) {
  int result = 0;
  // shift buff and append new input to the end
  for (int i = 0; i < length - 1; i++) {
    buff[i] = buff[i + 1];
  }
  buff[length - 1] = input;

  // calculate the weight sum
  for (int i = 0; i < length; i++) {
    result += coeff[i] * buff[length - 1 - i];
  }

  result = result >> FIXED_BIT;

  return result;
}

//////////////////////////////////////////////////
//  One dimensional Kalman Filter
//////////////////////////////////////////////////

// Implementation of a one dimensional kalman filter

// Kalman Gain:                               K_k
// Estimation of current iteration:           x_hat
// Error of estimation of current iteration:  e_EST_k
// Error of measurement:                      e_MEA

// Steps in each iteration:
// 1. update Kalman Gain:
//   K_k = \frac{{e_EST}_{k-1}}{{e_EST}_{k-1}+{e_{MEA}}_k}
// 2. update estimation
//   {\hat{x}}_k = {\hat{k}}_{k-1} + K_k * (Z_k - {\hat{k}}_{k-1})
// 3. update error of estimation
//   {e_{EST}}_k = (1 - K_k) * {e_{EST}}_{k-1}

/*int kalman_fixed_update(Kalman_fixed_ptr Kptr, int x) {*/
/*Kptr->K_k = (Kptr->e_EST_k) / (Kptr->e_EST_k + Kptr->e_MEA);*/
/*printf("K_k: %5d\n", Kptr->K_k);*/
/*Kptr->x_hat = (Kptr->x_hat) + Kptr->K_k * (x - Kptr->x_hat);*/
/*printf("x_hat: %5d\n", Kptr->x_hat);*/
/*Kptr->e_EST_k = (1 - Kptr->K_k) * Kptr->e_EST_k;*/
/*printf("e_EST_k: %5d\n", Kptr->e_EST_k);*/
/*return Kptr->x_hat >> FIXED_BIT;*/
/*}*/

int kalman_fixed_update(int *k, int *r, int *p, int *q, int *x_hat, int x) {
  *p = *p + *q;
  *k = *p << FIXED_BIT / (*p + *r);
  *x_hat = *x_hat + *k * (x - *x_hat) >> FIXED_BIT;
  *p = (1 - *k) * *p >> FIXED_BIT;
  return *x_hat;
}
