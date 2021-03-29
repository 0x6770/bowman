#!/usr/bin/env python3
""" This is an interactive client that can connect to remote server via
    Socket IO and send post request to join game, fire arrow and
"""
from asyncio import run, get_event_loop
from time import time
from sys import  exit, platform
from json import loads
from socketio import AsyncClient, exceptions
from requests import post, get, exceptions as request_exceptions

sio = AsyncClient()
TOTAL_LATENCY = {"websocket":{"c2s":0,"s2c":0},"http":{"c2s":0,"s2c":0}}
NUM_LOOP = 1000
NUM_RECEIVED = {"websocket":0,"http":0}

@sio.on("latency")
async def latency(data):
    global TOTAL_LATENCY, NUM_RECEIVED
    """ data: {
            tc: int # time_sent_by_client
            ts: int # time_received_by_server
        }
    """
    now = time()
    tc = data["tc"]
    ts = data["ts"]
    latency_c2s = ts-tc
    latency_s2c = now-ts
    TOTAL_LATENCY["websocket"]["c2s"] += latency_c2s
    TOTAL_LATENCY["websocket"]["s2c"] += latency_s2c
    NUM_RECEIVED["websocket"] += 1
    # print(f"latency from client to server is {latency_c2s}")
    # print(f"latency from server to client is {latency_s2c}")
    return

async def send():
    await sio.emit("latency test", {"tc":time()})
    await sio.sleep(0.02)

async def main():
    """ main function
    """
    global PID, URL, TOTAL_LATENCY, NUM_LOOP, NUM_RECEIVED
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
            exit()
        print("\033[0;31m[CLIENT] : Invalid choice\033[0m")
        use_default = input(prompt)
    URL = "http://"+host+":"+port

    try:
        await sio.connect(URL)
        print("[SERVER] : Server connected")
    except exceptions.ConnectionError as error:
        print(error)
        exit()

    for i in range(0, NUM_LOOP):
        await send()
    await sio.sleep(1)

    for i in range(0, NUM_LOOP):
        t0 = time()
        try:
            result = get(url = URL + "/latency").json()
            NUM_RECEIVED["http"] += 1
            t1 = time()
            TOTAL_LATENCY["http"]["c2s"] += (result["ts"]-t0)
            TOTAL_LATENCY["http"]["s2c"] += (t1-result["ts"])
        except:
            pass

    avg_latency_c2s = TOTAL_LATENCY["http"]["c2s"]/NUM_LOOP * 1000
    avg_latency_s2c = TOTAL_LATENCY["http"]["s2c"]/NUM_LOOP * 1000
    print("HTTP Request")
    print("average latency from client to server : %0.3f ms" % avg_latency_c2s)
    print("average latency from server to client : %0.3f ms" % avg_latency_s2c)
    print(f"reveived {NUM_RECEIVED['http']}/{NUM_LOOP} responses")
    print()

    print("WebSocket")
    avg_latency_c2s = TOTAL_LATENCY["websocket"]["c2s"]/NUM_LOOP * 1000
    avg_latency_s2c = TOTAL_LATENCY["websocket"]["s2c"]/NUM_LOOP * 1000
    print("average latency from client to server : %0.3f ms" % avg_latency_c2s)
    print("average latency from server to client : %0.3f ms" % avg_latency_s2c)
    print(f"reveived {NUM_RECEIVED['websocket']}/{NUM_LOOP} responses")

if __name__ == '__main__':
    loop = get_event_loop()
    try:
        loop.run_until_complete(main())
    except KeyboardInterrupt:
        exit()
