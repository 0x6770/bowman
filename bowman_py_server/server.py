#!/usr/bin/env python3
""" This file defines how does the server work
"""
from os import environ
from json import dumps
from asyncio import sleep, create_task
from random import randint
from uuid import UUID
from uvicorn import run
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.templating import Jinja2Templates
from socketio import AsyncServer, ASGIApp
from models.session import Session

load_dotenv()
HOST = environ.get("HOST")
PORT = int(environ.get("PORT"))
TURN = int(environ.get("TURN"))
TIME = int(environ.get("TIME"))

URL = "ws://"+HOST+":"+str(PORT)

app = FastAPI()
sio = AsyncServer(async_mode="asgi", cors_allowed_origins="*")
socket_app = ASGIApp(sio)
templates = Jinja2Templates(directory="")

players = []
arrows = []
codes = set() # max size = 1000

def generate_uniq_code():
    """ generate a unique 6 digit number
    """
    code = randint(1,9)*100000 + randint(0, 99999) # 6 digit number
    while len(codes) < 1000: # allow 1000 different codes
        if code in codes:
            code = randint(1,9)*100000 + randint(0, 99999) # 6 digit number
        else:
            codes.add(code)
            return code
    return 0

session = Session(generate_uniq_code())

async def keep_running(turn_total):
    """ deal with game turns
    """
    global players, arrows
    while True:
        global session
        current_turn = session.get_turn()
        if current_turn > 0:
            while current_turn <= turn_total:
                await sio.emit("turn", {"players":players,"turn":current_turn}, broadcast=True)
                for i in range(TIME, 0, -1):
                    await sleep(1)
                    await sio.emit("timer", {"time":i,"turn":current_turn}, broadcast=True)
                    if session.next_turn():
                        current_turn = session.get_turn()
                        break
            # the old game session is over
            players = []
            arrows = []
            await sio.emit("new", broadcast=True)
            await sio.emit("timer", {"time":-1,"turn":-1}, broadcast=True)
            await sio.emit("turn", {"players":players,"turn":-1}, broadcast=True)
            print(f"[{session.get_code()}] : game over")
            code = generate_uniq_code()
            if code == 0:
                return
            session = Session(code)
            print(f"[{session.get_code()}] : new game started")
        else:
            # print("game not started")
            await sleep(1)

async def broadcast(socket, data):
    """ broadcast a json object via socket io
    """
    await socket.emit("update", data, broadcast=True)

@app.on_event("startup")
async def startup_event():
    """ define what happens when start up this application
    """
    create_task(keep_running(TURN))

@app.get("/")
def root(request: Request):
    """ serve home page
    """
    return templates.TemplateResponse("index.html", {"request": request, "url": URL})

class JointRequest(BaseModel):
    name: str

@app.post("/join")
async def join_game(request : JointRequest):
    """ add player to game session
    """
    global players, arrows
    name = request.name
    msg = session.add_player(name)
    response = {"msg": msg}
    if "can not" in str(msg):
        return response
    pid = msg
    players = session.get_players_info()
    arrows = session.get_arrows_info()
    await broadcast(sio, {"players":players,"arrows":arrows,"turn":session.get_turn()})
    response = {"msg": "success", "pid": pid}
    return response

class QuitRequest(BaseModel):
    pid: str

@app.post("/quit")
async def quit_game(request: QuitRequest):
    """ remove player from game session
    """
    global players, arrows
    pid = request.pid

    try:
        UUID(pid)
    except ValueError:
        response = {"msg": "invalid pid"}
        return response

    session.delete_player(pid)
    players = session.get_players_info()
    arrows = session.get_arrows_info()
    await broadcast(sio, {"players":players,"arrows":arrows,"turn":session.get_turn()})
    response = {"msg": "success"}
    return response

@app.post("/start")
async def start_game():
    """ start a game
    """
    global players, arrows
    msg = session.start_game()
    await broadcast(sio, {"players":players,"arrows":arrows,"turn":session.get_turn()})
    return {"msg":msg}

@app.post("/next")
async def next_turn():
    """ progress to next turn
    """
    global players, arrows
    msg = session.next_turn()
    await broadcast(sio, {"players":players,"arrows":arrows,"turn":session.get_turn()})
    return {"msg":msg}

class AngleRequest(BaseModel):
    pid: str
    angle: int

@app.post("/angle")
async def change_angle(request: AngleRequest):
    """ change angle of arrow of a player
    """
    pid = request.pid
    angle = request.angle

    try:
        UUID(pid)
    except ValueError:
        response = {"msg": "invalid pid"}
        return response

    result = session.change_angle(pid, angle)
    if result["msg"] == "success":
        global players, arrows
        arrows = session.get_arrows_info()
        await broadcast(sio, {"players":players,"arrows":arrows,"turn":session.get_turn()})
        return result
    return result

class FireRequest(BaseModel):
    pid: str
    angle: int
    velocity: int

@app.post("/fire")
async def fire_arrow(request: FireRequest):
    """ fire the arrow of a player
    """
    pid = request.pid
    angle = request.angle
    velocity = request.velocity

    result = session.fire_arrow(pid, angle, velocity)
    if result["msg"] == "success":
        await sio.emit("fire", dumps(result), broadcast=True)
        global players, arrows
        players = session.get_players_info()
        await broadcast(sio, {"players":players,"arrows":arrows,"turn":session.get_turn()})
        return result
    return result

# define socket io event handler
@sio.on("connect")
def connect(sid, environ):
    print(f"Client connected, {sid}")

@sio.on("message")
async def handle_message(pid, message):
    print(f"Received message: \"{message}\" from {pid}")
    global players, arrows
    await sio.emit("update", {"players":players,"arrows":arrows,"turn":session.get_turn()},
            room=pid)

@sio.on("disconnect")
def disconnect(sid):
    print(f"Client disconnected, {sid}")

app.mount("/", socket_app)

if __name__ == "__main__":
    run('server:app', host=HOST, port=PORT)
