""" define class Player
"""
from dotenv import load_dotenv
from os import environ
from uuid import uuid1
from random import randint
from time import time

load_dotenv()

colors = set() # all colors that had been used
TIME = int(environ.get("TIME"))

def generate_unique_color() -> str:
    """ generate a unique hex color string
    """
    size: int = 16**6
    color: str = "#%0.6X" % randint(0, size)
    while len(colors) < size:
        if color in colors:
            color = "#%0.6X" % randint(1, size)
        else:
            return color
    raise RuntimeError("Allocated all {size} hex colors".format(size = size))

class Player:
    """ class for player
    """
    def __init__(self, name: str):
        self.__name: str = name
        self.__id: str = uuid1()
        self.__x: int = randint(10, 90)
        self.__hp: int = 100
        self.__color: str = generate_unique_color()
        self.__turn: int = 0
        self.__time_end = time()

    def get_hp(self) -> int:
        """ get health point of this player
        """
        return self.__hp

    def get_pid(self) -> str:
        """ get id of this player
        """
        return self.__id

    def get_color(self) -> str:
        """ get color of this player
        """
        return self.__color

    def get_x(self) -> int:
        """ get x of this player
        """
        return self.__x

    def get_name(self) -> str:
        """ get name of this player
        """
        return self.__name

    def get_turn(self) -> int:
        """ get current turn number
        """
        return self.__turn

    def get_time_end(self) -> int:
        """ get the end time of this turn for this player
        """
        return self.__time_end

    def start_game(self) -> int:
        """ start game
        """
        self.__time_end = time() + self.__hp/100 * TIME
        return self.__time_end

    def next_turn(self) -> None:
        """ go to next turn
        """
        self.__time_end += self.__hp/100 * TIME

    def update_turn(self) -> None:
        """ turn++
        """
        self.__turn += 1

    def hurt(self, damage: int) -> int:
        """ apply damage to this player
            return remaining health point
        """
        if self.__hp > 0:
            self.__hp -= damage
        if self.__hp < 0:
            self.__hp = 0
        return self.__hp

if __name__ == "__main__":
    print("testing class Player")
    player = Player("abc")
    print("name: {name}".format(name = player.get_name()))
    print("color: {color}".format(color = player.get_color()))
    print("pid: {pid}".format(pid = player.get_pid()))
    print("x: {x}".format(x = player.get_x()))
    print("hp: {hp}".format(hp = player.get_hp()))
    print(" hurt by 10")
    player.hurt(10)
    print("hp: {hp}".format(hp = player.get_hp()))
    print(" hurt by 100")
    player.hurt(100)
    print("hp: {hp}".format(hp = player.get_hp()))
