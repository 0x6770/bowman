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
	alt_32 x_read;
	    int button_datain;
	    int switch_datain;
		int velocity_strength;
		int maxi_velo;   // get maximum velocity limit from the server;
		int LED_dataout;
		int base_angle;
		int output_angle; //range from 0 - 180;
		int output_velocity;//range from 0 - 100;
	    int temp;
	    int temp1;
	    int unfilt;
	    int scaled_val;
	    int angle_max=130;
	    int angle_min=-130;
	    int range = 260;
	    int cal_val;
	    int degree;

	//Initialize values
		base_angle= 0;
		maxi_velo = 100;
		time_count= 40;

		output_angle = 1;
		output_velocity = 1;

	    //initial values for the kalman filter
	    float x_est_last = 0;
	    float P_last = 0;
	    float K;
	    float Error_EST =3;
	    float Error_Last=3;
	    float Error_Measured = 5;
	    float x_est;
	    int x_last;

	    //Setting up device
	    alt_up_accelerometer_spi_dev * acc_dev;
	    acc_dev = alt_up_accelerometer_spi_open_dev("/dev/accelerometer_spi");
	    if (acc_dev == NULL) { // if return 1, check if the spi ip name is "accelerometer_spi"
	        return 1;
	    }
	    timer_init(sys_timer_isr);

		while(1){

	//Kalman Filtering
			Error_EST =4;
			Error_Last=4;
			for(int i = 1000; i>=0;i--){
				alt_up_accelerometer_spi_read_x_axis(acc_dev, & x_read);
				unfilt = (x_read - base_angle)>>1;
				K = Error_Last * (1.0/(Error_Last + Error_Measured));
				x_est = x_est_last + K * (unfilt - x_est_last);
				Error_EST = (1- K) * Error_Last;
				Error_Last = Error_EST;
				x_est_last = x_est;
			}
	//Filtering finished result is x_est;
			convert_read(x_est, & level, & led);
			cal_val = (x_est - angle_min); //make x_read range 0-520
			degree = cal_val*180/range;
//				alt_printf("\n     angle is adjusted angle is  ");
//				visualizeint(degree);
			IOWR_ALTERA_AVALON_PIO_DATA(HEX_2_BASE, getBin(degree/100));
			IOWR_ALTERA_AVALON_PIO_DATA(HEX_1_BASE, getBin((degree/10)%10));
			IOWR_ALTERA_AVALON_PIO_DATA(HEX_0_BASE, getBin(degree%10));

	//Gathering Button data;
				button_datain = ~IORD_ALTERA_AVALON_PIO_DATA(BUTTON_BASE);
				button_datain = button_datain +4;
				if(button_datain ==2){
					base_angle = x_read;
					angle_max = 130;
					angle_min = -130;
					range = 260;
				}
				if(button_datain ==1){
					break;
				}
			}
	//starting of selecting velocity
			while(1){
				clock_t t0 = clock(0);
				clock_t t = clock(0);
				while(time_count >= 0 && ((t -t0)<1000)){
					switch_datain = IORD_ALTERA_AVALON_PIO_DATA(SWITCH_BASE);
					button_datain = IORD_ALTERA_AVALON_PIO_DATA(BUTTON_BASE);
					button_flag(button_datain);
					velocity_strength = calculate_velocity(switch_datain);
					if(maxi_velo<velocity_strength){ velocity_strength = maxi_velo;}
					LED_dataout = light_LED(velocity_strength);
					IOWR(LED_BASE, 0, LED_dataout);
					display_time(time_count);
					t = clock(0);
				}
//				alt_printf("LED pattern: %x Switch is %x Button is %x\n",LED_dataout,velocity_strength/5-2,button_datain);
//				alt_printf("Time remaining: %x\n",time_count);
				printf("%d\n",sent);

				if(time_count>0){
					time_count = time_count - 1;
				}
				else{
					// halt to wait the information from the host;
				}

				if(time_count == 0 || sent == 1){
					// the the current velocity to the host;
					// either when the time's up
					// or a sent flag is raised;
					time_count = 0;
					break;
				}
			}
//			alt_printf("\nFinal Angle is: ");
//			visualizeint(degree);
//			alt_printf(" with velocity ");
//			visualizeint((velocity_strength/5)-2);




	printf("Running..\n");
	FILE* fp;

	int prompt; //hp rate received
	float angle = degree;
	float force = (velocity_strength/5)-2;

	fp = fopen ("/dev/jtag_uart", "r+");
	if (fp) {
		while (prompt != 0) {
			prompt = getc(fp);
			//prompt = gets(fp);
			if (prompt != 0) {
				//int temp = prompt-1;
				fprintf(fp, "<--> HP rate is %c, angle rate is %f, force is %f. <--> \n %c", prompt,angle,force, 0x4); //%d becomes ascii number

			}
			if (ferror(fp)) {
				clearerr(fp);
			}
		}
		fprintf(fp, "<--> Closing the JTAG UART file handle. <--> \n %c",0x4);
		fclose(fp);
	}
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

