#!/usr/bin/env python3
""" a socket io client
"""
import sys
from os import environ
from json import dumps
from requests import post
from dotenv import load_dotenv
from socketio import Client, exceptions

load_dotenv()

HOST = str(environ.get("HOST"))
PORT = str(environ.get("PORT"))
URL = f"http://{HOST}:{PORT}"

sio = Client()
PID = None
TURN = 0

@sio.event
def connect():
    print("I'm connected!")

@sio.event
def turn(data):
    global TURN
    TURN = data["turn"]
    players = data["players"]
    # print(f"[TURN] : {data}")
    print(dumps(data, indent=4, sort_keys=True))
    if PID is not None:
        for player in players:
            if player["pid"] == PID:
                print(f"[{PID} | hp] : {player['hp']}")

try:
    sio.connect(URL)
except exceptions.ConnectionError as e:
    print(e)
    sys.exit()

def main():
    global PID, TURN

    player1 = post(url = URL+"/join", json = {"name":"111"}).json()
    player2 = post(url = URL+"/join", json = {"name":"111"}).json()

    if player1["msg"] != "success":
        print(player1["msg"])
        return
    if player2["msg"] != "success":
        print(player2["msg"])
        return

    # store pid from response
    pid1 = player1["pid"]
    pid2 = player2["pid"]
    PID = pid2

    # start the game
    post(url = URL+"/start")

    while TURN >= 0:
        # fire arrow
        data1 = {"pid":pid1,"angle":40,"velocity":20}
        post(url = URL+"/fire", json = data1)
        data2 = {"pid":pid2,"angle":30,"velocity":20}
        post(url = URL+"/fire", json = data2)

    sio.disconnect()


if __name__ == "__main__":
    main()
