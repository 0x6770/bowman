#!/usr/bin/env python3
""" This script demonstrate interaction with bowman server using REST API and socket io
"""
import sys
from os import system,environ
from socket import socket, AF_INET, SOCK_STREAM, SHUT_RDWR
from dotenv import load_dotenv
from requests import post
from socketio import Client

load_dotenv()

HOST = str(environ.get("HOST"))
PORT = str(environ.get("PORT"))
TIME = int(environ.get("TIME"))
HP = -1
PLAYER = {"name":"Your name","hp":100,"pid":"","turn":0}
OVER = False

URL = "http://"+HOST+":"+PORT

sio = Client()

@sio.event
def connect():
    """ test connection to server
    """
    print("Server connected!")

@sio.event
def turn(data):
    """ get updated player information at the end of each turn
    """
    global OVER
    turn = data["turn"]
    PLAYER["turn"] = turn
    if turn < 0:
        OVER = True
        print("Game is over")
        sys.exit()
    else:
        print_player()

# @sio.event
# def update(data):
    # catches real time updates from the server

class Player:
    """ Player: name, pid, angle, velocity
    """
    def __init__(self, name):
        self.__name = name
        self.__pid = None
        self.__angle = 45
        result = post(url = URL+"/join", json = {"name":name}).json()
        if result["msg"] != "success":
            print(result["msg"])
            return
        self.__pid = result["pid"]
        PLAYER["pid"] = result["pid"]
        PLAYER["name"] = name

    def get_name(self):
        """ get name of this player
        """
        return self.__name

    def get_pid(self):
        """ get pid of this player
        """
        return self.__pid

    def get_angle(self):
        """ get angle of this player
        """
        return self.__angle

    def fire(self):
        """fire an arrow with angle=ANGLE, velocity=velocity
        """
        velocity = int(input("force[0-100]: "))
        data = {"pid":self.__pid,"angle":self.__angle,"velocity":velocity}
        if OVER:
            return
        try:
            result = post(url = URL+"/fire", json = data)
        except ConnectionError:
            print("connection error")
            return
        if result.status_code != 200:
            return
        result = result.json()
        msg = result["msg"]
        if msg == "success":
            print(f"[LAST CMD] : \033[32;1m{msg}\033[0m")
        else:
            print(f"[LAST CMD] : \033[31;1m{msg}\033[0m")

    def __del__(self):
        """quit the game
        """
        print("quiting game... ")
        if self.__pid is None:
            return
        data = {"pid":self.__pid}
        result = post(url = URL + "/quit", json = data).json()["msg"]
        print("\033[32;1m{result}\033[0m".format(result = result))

def is_server_up(host:str, port:int):
    """check if the remote server is up
    """
    s = socket(AF_INET, SOCK_STREAM)
    s.settimeout(1)
    try:
        s.connect((host, port))
        s.shutdown(SHUT_RDWR)
        print("Server at {url} is up".format(url = URL))
        return True
    except ConnectionError:
        return False
    finally:
        s.close()

def print_player():
    """ print out information about current player
    """
    print("\n"                                                       +
          "+-------------------------------------------+\n"          +
          "| Name: \033[1m{0:<15}\033[0m ".format(PLAYER["name"])    +
          "| HP: \033[1m{0:<3}\033[0m ".format(PLAYER["hp"])         + (
          "| waiting |\n" if PLAYER["turn"] == 0 else
          "| Turn: \033[1m{0:<1}\033[0m |\n".format(PLAYER["turn"])) +
          "+-------------------------------------------+")

def main():
    """ main function
    """
    if not is_server_up(HOST, int(PORT)):
        print(f"Server at {URL} is not up, please check and retry")
        return

    sio.connect(URL)
    name = input("Please Enter Your Name: ")

    player = Player(name)
    if player.get_pid() is None:
        del player
        sio.disconnect()
        sys.exit()

    while not OVER:
        print_player()
        print("Charging an arrow")
        player.fire()

    del player
    sio.disconnect()

if __name__=="__main__":
    main()
