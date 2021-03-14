#!/usr/bin/env python3
"""This script demonstrate interaction with bowman server using REST API
"""
from sys import argv
from socket import socket, AF_INET, SOCK_STREAM, SHUT_RDWR
from requests import post

LOCATION = "localhost"
PORT = 8080

if len(argv) > 2:
    LOCATION = argv[1]
    PORT = argv[2]

URL = "http://"+LOCATION+":"+str(PORT)

class Player:
    """Player: name, id, angle, velocity
    """
    def __init__(self, name):
        self.name = name
        result = post(url = URL+"/join", json = {"name":name}).json()
        if result["msg"] != "success":
            self.__del__()
        self.id = result["id"]
        self.angle = 45

    def print(self):
        """print out information about this player
        """
        print("name: \033[1m{name}\033[0m, angle: \033[1m{angle}\033[0m degree".format(
            name = self.name,
            angle = self.angle,
            ))

    def adjust_angle(self):
        """change angle
        """
        self.angle = int(input("angle: "))
        data = {"id":self.id,"angle":self.angle}
        result = post(url = URL+"/angle", json = data).json()["msg"]
        print("\033[32;1m{result}\033[0m".format(result = result))

    def fire(self):
        """fire an arrow with angle=ANGLE, velocity=velocity
        """
        velocity = int(input("velocity: "))
        data = {"id":self.id,"angle":self.angle,"velocity":velocity}
        result = post(url = URL+"/fire", json = data).json()["msg"]
        print("\033[32;1m{result}\033[0m".format(result = result))

    def __del__(self):
        """quit the game
        """
        print("quiting game... ")
        data = {"id":self.id}
        result = post(url = URL + "/quit", json = data).json()["msg"]
        print("\033[32;1m{result}\033[0m".format(result = result))

def is_server_up(location, port):
    """check if the remote server is up
    """
    s = socket(AF_INET, SOCK_STREAM)
    s.settimeout(1)
    try:
        s.connect((location, int(port)))
        s.shutdown(SHUT_RDWR)
        print("server at {url} is up".format(url = URL))
        return True
    except ConnectionError:
        return False
    finally:
        s.close()

def main():
    """main function
    """
    if not is_server_up(LOCATION, PORT):
        print("server at {url} is not up, please check and retry".format(url = URL))
        print("to use other address/port, run this script as ./game.py [address] [port]")
        return
    name = input("Please Enter Your Name: ")
    player = Player(name)
    while True:
        print("==============================")
        player.print()
        print("==============================")
        print("1) Adjust angle")
        print("2) Fire an arrow")
        print("q) Quit the game")
        choice = input("Your choice: ")
        if choice == "1":
            player.adjust_angle()
        elif choice == "2":
            player.fire()
        elif choice == "q":
            print("player {name} quit".format(name = player.name))
            break
        else:
            print("\033[31munknown choice: {choice}, enter 'q' to quit\033[0m"\
                    .format(choice = choice))
    del player

if __name__=="__main__":
    main()
