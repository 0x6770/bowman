#!/usr/bin/env python3
""" This is an interactive client that can connect to remote server via
    Socket IO and send post request to join game, fire arrow and
"""
import sys
from subprocess import run, CalledProcessError, PIPE
from json import loads
from time import sleep
from socketio import Client, exceptions
from requests import post

START = False
OVER = False
TURN = -1
PID = None
HP = -1
sio = Client()

def quit_game(msg: str):
    """ terminate this client
    """
    print(msg)
    if sio.connected:
        sio.disconnect()
    sys.exit()

@sio.event
def turn(data):
    """ get updated player information at the start of each turn
        and end of the game
        {
            turn: int
            players: [{pid: int, hp: int}]
        }
    """

    global TURN, PID, URL, HP
    TURN = int(data["turn"])
    players = data["players"]
    if START:
        if TURN < 0:
            print("[SERVER] : Game over.")
            if HP > 0:
                quit_game("\033[1;33mCongratulations, You win!!!\033[0m")
            else:
                quit_game("\033[1;34mSorry, you did not make it.\033[0m")
        if TURN == 1:
            print("[SERVER] : Game start!!!!!!!")
        print(f"[SERVER] : \033[1;34m===== Start turn {TURN} =====\033[0m")
        for player in players:
            if player["pid"] == PID:
                HP = player["hp"]
        if HP == 0:
            print("[SERVER] : Your HP is 0")
            quit_game("[SERVER] : Game over.")
        print(f"[SERVER] : Your current HP: {HP}")

        #TODO: 从res中提取angle和velocity
        angle, velocity = send_on_jtag(HP)

        this_turn_info = {"pid":PID,"angle":angle,"velocity":velocity}
        print("[CLIENT] : Time is up!")
        print(f"[CLIENT] : Your arrow is fired with angle={angle} and velocity={velocity}.")
        result = post(url = URL + "/fire", json = this_turn_info).json()
        msg = result["msg"]
        if msg != "success":
            print(msg)

def send_on_jtag(hp: int):
    """ send 'hp' value to the board
        and get 'angle' and 'velocity' from its response
    """
    print(f"[JTAG]   : sending hp = {hp} to the board")
    angle = 45
    velocity = 20
    return angle, velocity

def main():
    """ main function
    """
    global PID, URL, TURN, START
    # step 1
    host = "localhost"
    port = str(1818)
    prompt = f"[CLIENT] : Connect to default address {host}:{port}? (y/n/q)"
    use_default = input(prompt)
    while ('y' or 'Y') not in use_default:
        if ('n' or 'N') in use_default:
            host = input("           Please input server IP: ")
            port = input("           Please input server port: ")
            break
        if 'q' in use_default:
            sys.exit()
        print("\033[0;31m[CLIENT] : Invalid choice\033[0m")
        use_default = input(prompt)
    URL = "http://"+host+":"+port
    name = input("[SERVER] : Please name your character: ")
    print("[CLIENT] : Waiting for server response......")
    try:
        sio.connect(URL)
        print("[SERVER] : Game connected!!!!!!!")
    except exceptions.ConnectionError as error:
        quit_game(f"\033[0;31m[SERVER] : {error}\033[0m")

    # send join game request with player name
    result = post(url = URL+"/join", json = {"name":name}).json()
    if result["msg"] != "success":
        quit_game(f"\033[0;31m[SERVER] : {result['msg']}\033[0m")
    START = True
    PID = result["pid"]
    print(f"[SERVER] : \033[1mHello {name} :)\033[0m")
    print("[SERVER] : Waiting for other players......")
    sio.wait()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        if PID is not None:
            quit_res = post(url = URL+"/quit", json = {"pid":PID}).json()
            if quit_res["msg"] == "success":
                print("[SERVER] : quited from the game")
        quit_game("")
