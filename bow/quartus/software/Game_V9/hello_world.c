#include "system.h"
#include "altera_up_avalon_accelerometer_spi.h"
#include "altera_avalon_timer_regs.h"
#include "altera_avalon_timer.h"
#include "altera_avalon_pio_regs.h"
#include "sys/alt_irq.h"
#include <sys/alt_stdio.h>
#include "sys/alt_stdio.h"

#include <stdlib.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <math.h>
#include <string.h>
#include <unistd.h>
#include "sys/times.h"
#include "alt_types.h"



// global variables:
#define OFFSET -32
#define PWM_PERIOD 8

alt_8 pwm = 0;
alt_u16 led;
int level;

int time_count; // from server;
int sent; // the flag used the information back to the host;

void led_write(alt_u16 led_pattern);
void convert_read(alt_32 acc_read, int * level, alt_u16 * led);
void sys_timer_isr();
void timer_init(void * isr);
void visualizeint(int x_read);

void display_time(int times);
int getBin(int number);
int extract_digit_front(int digits);
int extract_digit_back(int digits);
int calculate_velocity(int switch_in);
int light_LED(int velo);
void button_flag(int in);



int main()
{


	printf("Complete\n");

	return 0;
}


int calculate_velocity(int switch_in){
	// values to be determined
	int ini_velocity = 10;
	switch(switch_in){
	case 0b0000000001:
		return ini_velocity+5;
	case 0b0000000010:
		return ini_velocity+10;
	case 0b0000000100:
		return ini_velocity+15;
	case 0b0000001000:
		return ini_velocity+20;
	case 0b0000010000:
		return ini_velocity+25;
	case 0b0000100000:
		return ini_velocity+30;
	case 0b0001000000:
		return ini_velocity+35;
	case 0b0010000000:
		return ini_velocity+40;
	case 0b0100000000:
		return ini_velocity+45;
	case 0b1000000000:
		return ini_velocity+50;
	default:
		return ini_velocity;
	}
}


int light_LED(int velo){
	int mag = velo/5;
	switch(mag){
	case 2:
		return 0b0000000000;
	case 3:
		return 0b0000000001;
	case 4:
		return 0b0000000011;
	case 5:
		return 0b0000000111;
	case 6:
		return 0b0000001111;
	case 7:
		return 0b0000011111;
	case 8:
		return 0b0000111111;
	case 9:
		return 0b0001111111;
	case 10:
		return 0b0011111111;
	case 11:
		return 0b0111111111;
	case 12:
		return 0b1111111111;
	}
}

int getBin(int number){
	switch(number){
	case 0:
		return 0b1000000;
	case 1:
		return 0b1111001;
	case 2:
		return 0b0100100;
	case 3:
		return 0b0110000;
	case 4:
		return 0b0011001;
	case 5:
		return 0b0010010;
	case 6:
	    return 0b0000010;
	case 7:
		return 0b1111000;
	case 8:
		return 0b0000000;
	case 9:
		return 0b0010000;
	default:
		return 0b1111111;
	}
}

int extract_digits_front(int digits){
	int front;
	return front = digits/10;
}

int extract_digits_back(int digits){
	int back;
	return back = digits%10;
}

void display_time(int times){
	IOWR_ALTERA_AVALON_PIO_DATA(HEX_5_BASE, getBin(extract_digits_front(times)));
	IOWR_ALTERA_AVALON_PIO_DATA(HEX_4_BASE, getBin(extract_digits_back(times)));
	if(times == 0){
		IOWR_ALTERA_AVALON_PIO_DATA(HEX_5_BASE, getBin(0));
		IOWR_ALTERA_AVALON_PIO_DATA(HEX_4_BASE, getBin(0));
	}
}

void button_flag(int in){
	if(in == 2){
		sent = 1;
	}
	else{
		sent = 0;
	}
}


void led_write(alt_u16 led_pattern) {
	    IOWR(LED_BASE, 0, led_pattern);
}

void convert_read(alt_32 acc_read, int * level, alt_u16 * led) {
    acc_read += OFFSET;
	alt_u16 temp = acc_read >>5;
    alt_u16 val = (acc_read >>5) & 0x0f;
//    alt_printf("value is %x  raw is %x  temp is :%x\n",val,acc_read,temp);

    //based on 0b0001000000 to shift when board is flat the val is 0x0e; by calculation got the code;
    if(val >= 0xa | val <= 0x3){
        * led = (0x40 << val) | (0x40 >> (0x10 - val));
    }
    * led = *led & 0x03ff;

    // acc_read >> 1 to eliminate the oscillation of the LSB
    * level = (acc_read>>1 ) & 0x0f;
//    alt_printf("level is %x  raw is %x  temp is :%x\n",* level,acc_read,temp);


}

void sys_timer_isr() {
    IOWR_ALTERA_AVALON_TIMER_STATUS(TIMER_BASE, 0);
//    alt_printf("pwm period is %x and abs(level) is %x\n", pwm, abs(level));
    if (pwm > abs(level)) {
        if (level < 0 && led!= 0x000) {
            led_write((led << 1));
        } else if(led!= 0x0200){
            led_write((led >> 1));
        }

    } else {
        led_write(led);
    }
    if (pwm > PWM_PERIOD) {
        pwm = 0;
    } else {
        pwm++;
    }
}

void timer_init(void * isr) {

    IOWR_ALTERA_AVALON_TIMER_CONTROL(TIMER_BASE, 0x0003);
    IOWR_ALTERA_AVALON_TIMER_STATUS(TIMER_BASE, 0);
    IOWR_ALTERA_AVALON_TIMER_PERIODL(TIMER_BASE, 0x0900);
    IOWR_ALTERA_AVALON_TIMER_PERIODH(TIMER_BASE, 0x0000);
    alt_irq_register(TIMER_IRQ, 0, isr);
    IOWR_ALTERA_AVALON_TIMER_CONTROL(TIMER_BASE, 0x0007);
}


void visualizeint(int x_read){
	int pro_val;
    if(x_read < 0){
    	x_read *= -1;
    	pro_val = x_read;
		alt_printf("-%x",pro_val);

    }else{
    	pro_val = x_read;
		alt_printf("%x",pro_val);
    }
}

