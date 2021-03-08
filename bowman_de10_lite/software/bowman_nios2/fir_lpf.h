#ifndef FIR_LPF_H_
#define FIR_LPF_H_

#include <math.h>

#define FIXED_BIT 16

/* Use 16.16 Fixed Point Representation */
int float2fixed(float n);

/* Implementation of a Finite Impluse Filter using Fixed-Point
 * y[n] = \sum_{k=0}^{M}{b[k]*x[n-k]}
 * */
int fir_fixed(int length, int input, int *coeff, int *buff);

/* Implementation of a one dimensional kalman filter
 * Kalman Gain:
 *  K_k = \frac{{e_EST}_{k-1}}{{e_EST}_{k-1}+{e_{MEA}}_k}
 * Estimation of current iteration:
 *  {\hat{x}}_k = {\hat{k}}_{k-1} + K_k * (Z_k - {\hat{k}}_{k-1})
 * Error of estimation of current iteration:
 *  {e_{EST}}_k = (1 - K_k) * {e_{EST}}_{k-1}
 */
struct Kalman_fixed {
  int K_k;
  int e_EST_k;
  int e_MEA;
  int x_hat;
};

typedef struct Kalman_fixed *Kalman_fixed_ptr;

int kalman_fixed_update(int *k, int *r, int *p, int *q, int *x_hat, int x);

#endif
