## Bowman Server 

#### Quick Start

Firstly, make sure you installed all required dependences

```bash
pip install -r requirements.txt
```

Then, you can setup server and client by executing

```bash
./server.py
```

and

```bash
./client_interactive.py
```

By default, a web page will be served at http://localhost:1818 as a monitor to the playground.

To start a game, there must be at least two players joined the game. Then, you can send a POST request to http://localhost:1818/start to start a game. 

```bash
curl -s -X POST -H 'Content-Type: application/json' localhost:1818/start
```

#### Dependences

You can install all required dependences by `requirements.txt`

```
# /requirements.txt
requests==2.25.1
uvicorn==0.13.4
pydantic==1.8.1
fastapi==0.63.0
gevent_socketio==0.3.6
python-dotenv==0.15.0
```

#### Server

Run the `server.py` file would setup a server on `ip` and `port` specified in `.env`   

```
./server.py
```

#### Client

There are two different clients. One implemented only the basic function, `client_demo.py`. It stores `pid`s generated from response to join game request to server, and use them to fire arrows use fixed parameters until a session ends. Another client, `client_interactive.py`, allows user input to be used to set parameter of an arrow, and could be used to test whether the server would end turns and sessions by timeout.  

```bash
./clinet_demo.py
./client_interactive.py
```

#### Rules of this Game]

At least two players in one game session. 

After join a game session, a player must manually start this game session. 

At the start of each game session, every player has 100 health point (hp). 

Each game session contains several turns. 

Each turn has a time limit. 

A turn is ended either by hitting the time limit or because all alive player had taken action. 

A player can only shoot one arrow in one turn. 

A player can adjust the angle and velocity to shoot his arrow. 

Damage caused by arrow on player is calculated with each turn. 

Players with 0 hp can not shoot arrow. 

A game session will be automatically ended when all its turns ended. 

A new game session will start when the previous session is ended, but players need to rejoin the game. 

#### Environment Parameters

By default, both client and server will be configured based on `.env` file in the root path.

```
# /.env
HOST=localhost	# ip/domain of server
PORT=1818		# port number of server
TURN=3 			# total number of turns in a game session
TIME=30			# timeout in seconds for each turn
```

