""" define class Arrow
"""
from math import pi, cos, sin
from random import randint

a: int = -10     # gravitational acceleration
t: int = 0.02    # time interval

class Arrow:
    """ class for arrow
    """
    def __init__(self, x: int, y: int, color: str):
        self.__c: int = 0.025 + randint(1, 50)/10000 # air drag
        self.__color: str = color
        self.__x0: int = x
        self.__y0: int = y
        self.__x: int = x
        self.__y: int = y
        self.__vx: int = 0.0
        self.__vy: int = 0.0
        self.__angle: int = 45
        self.__velocity: int = 20

    def __update(self):
        """ update the position of this arrow
        """
        self.__y += (a * t ** 2) / 2 + self.__vy * t
        self.__x += self.__vx * t

        self.__vy += a * t + (-self.__c if self.__vy > 0 else self.__c) * self.__vy ** 2 * t
        self.__vx += (-self.__c if self.__vx > 0 else self.__c) * self.__vx ** 2 * t

    def fire(self, angle: int, velocity: int) -> int:
        """ fire this arrow, return the final x position of this arrow
        """
        angle_in_radian: int = (angle / 180) * pi
        self.__vx = velocity * cos(angle_in_radian)
        self.__vy = velocity * sin(angle_in_radian)

        self.__update()
        while self.__y > 0:
            self.__update()
        return self.__x

    def change_angle(self, angle: int) -> int:
        """ change angle of this arrow
        """
        self.__angle = angle

    def get_x0(self) -> int:
        """ get initial position of x of this arrow
        """
        return self.__x0

    def get_x(self) -> int:
        """ get x position of this arrow
        """
        return self.__x

    def get_angle(self) -> int:
        """ get angle of this arrow
        """
        return self.__angle

    def get_color(self) -> int:
        """ get color of this arrow
        """
        return self.__color

    def get_c(self) -> int:
        """ get coefficient of air drag of this arrow
        """
        return self.__c

if __name__ == "__main__":
    print("testing class Arrow")
    arrow = Arrow(10, 10, "#232323")
    print("c: {c}".format(c = arrow.get_c()))
    print("x0: {x0}".format(x0 = arrow.get_x0()))
    print("color: {color}".format(color = arrow.get_color()))
    print("angle: {angle}".format(angle = arrow.get_angle()))
    print("change angle to 60")
    arrow.change_angle(60)
    print("angle: {angle}".format(angle = arrow.get_angle()))
    print("x: {x}".format(x = arrow.get_x()))
    print("fire the arrow")
    arrow.fire(20, 20)
    print("x: {x}".format(x = arrow.get_x()))
