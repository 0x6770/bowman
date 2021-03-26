""" define class Session
"""
from os import environ
from typing import Dict, TypeVar
from uuid import UUID
from time import time
from dotenv import load_dotenv
from models.arrow import Arrow
from models.player import Player

load_dotenv()

TURN = int(environ.get("TURN"))

ReturnType = TypeVar(str, int, int, int, str, int, int)

def check_angle(angle: int) -> bool:
    """ check if an angle is in the range
    """
    if angle > 180-1 or angle < 1:
        return 0
    return 1

class Session:
    """ class for session
    """
    def __init__(self, code: int):
        self.__code: int = code
        self.__turn: int = 0
        self.__players: int = dict()
        self.__arrows: int = dict()

    def add_player(self, name: str) -> str:
        """ add new player to players
        """
        if self.__turn > 0:
            msg = "game has started, can not join"
            return msg
        player = Player(name)
        pid = player.get_pid()
        self.__players[pid] = player
        self.__arrows[pid] = Arrow(player.get_x(), 0, player.get_color())
        print(f"[{self.__code}] Player {name} joined game.")
        return pid

    def delete_player(self, pid: str) -> None:
        """ delete a player from players
        """
        if len(self.__players) == 0:
            return
        pid = UUID(pid)
        name = self.__players[pid].get_name()
        del self.__players[pid]
        del self.__arrows[pid]
        print(f"[{self.__code}] Player {name} quited game.")

    def get_arrows_info(self):
        """ return a json list containing information about all arrows
        """
        return [{   "x0": arrow.get_x(),
                    "angle": arrow.get_angle(),
                    "color": arrow.get_color()
                } for pid, arrow in self.__arrows.items()]

    def get_players_info(self):
        """ return a json list containing information about players
        """
        return [{   "pid":str(pid),
                    "name": player.get_name(),
                    "x0": player.get_x(),
                    "hp": player.get_hp(),
                    "color": player.get_color()
                } for pid, player in self.__players.items()]

    def get_turn(self) -> int:
        """ return current turn number
        """
        return self.__turn

    def get_players(self) -> Dict:
        """ return the players
        """
        return self.__players

    def get_arrows(self) -> Dict:
        """ return the arrows
        """
        return self.__arrows

    def get_code(self) -> int:
        """ return code
        """
        return self.__code

    def start_game(self):
        """ start game
        """
        min_player = 2
        if len(self.__players) < min_player:
            msg = f"only {len(self.__players)} player joined, at least {min_player}"
            print(msg)
            return msg
        if self.__turn == 0:
            self.__turn = 1
            msg = "Game started"
            for pid, player in self.__players.items():
                player.start_game()
            print(msg)
            return "success"
        msg = "Game has already started"
        print(msg)
        return msg

    def next_turn(self) -> bool:
        """ progress to next turn
        """
        num_player = len(self.__players)
        num_player_completed = 0
        num_player_alive = num_player
        print(f"{num_player} players in the game")

        if num_player == 0 or self.__turn == 0:
            # print("Game has not been started yet")
            return False

        for pid, player in self.__players.items():
            if player.get_hp() == 0:
                print(f"player {player.get_name()} has {player.get_hp()} hp")
                num_player_completed += 1
                num_player_alive -= 1
            elif player.get_turn() >= self.__turn:
                num_player_completed += 1
            elif time() >= player.get_time_end():
                num_player_completed += 1
                player.update_turn()
        print(f"{num_player_completed}/{num_player} has completed turn {self.__turn}")

        if num_player_alive < 2:
            self.__turn = TURN+1
            print(f"Only one player left, game over")
            return True

        if num_player == num_player_completed:
            self.__turn += 1
            print(f"New turn started, turn {self.__turn}")
            for pid, player in self.__players.items():
                player.next_turn()
            return True

        return False

    def change_angle(self, pid: str, angle: int):
        """ fire an arrow
        """
        message = {"msg": ""}
        pid = UUID(pid)
        arrow = self.__arrows.get(pid)

        if arrow is None:
            msg = "invalid pid."
            print(msg)
            message["msg"] = msg
            return message

        if not check_angle(angle):
            msg = "invalid value for parameter 'angle'"
            print(msg)
            message["msg"] = msg
            return message

        player = self.__players[pid]

        arrow.change_angle(angle)
        angle_after = arrow.get_angle()
        if angle_after != int(angle):
            message["msg"] = "operation failed"
            return message

        print(f"[{self.__code}] Player {player.get_name()} changed angle to {angle_after}.")
        message["msg"] = "success"
        return message

    def fire_arrow(self, pid: str, angle: int, velocity: int) -> ReturnType:
        """ fire an arrow
        """
        message = {"msg": "", "x0": 0, "x": 0, "c": 0, "color": "", "angle": 0, "velocity": 0}
        pid = UUID(pid)
        player = self.__players[pid]

        if player is None:
            msg = "invalid pid."
            print(msg)
            message["msg"] = msg
            return message

        if self.__turn == 0:
            msg = "game has not started yet, cannot fire."
            print(msg)
            message["msg"] = msg
            return message

        if self.__turn > TURN:
            msg = "game is over, cannot fire."
            print(msg)
            message["msg"] = msg
            return message

        if player.get_turn() >= self.__turn:
            msg = "player has completed this turn, cannot fire."
            print(msg)
            message["msg"] = msg
            return message

        if player.get_hp() == 0 :
            msg = "player has 0 HP, cannot fire."
            print(msg)
            message["msg"] = msg
            return message

        if not check_angle(angle):
            msg = "invalid value for parameter 'angle'"
            print(msg)
            message["msg"] = msg
            return message

        if velocity > 100 or velocity < 1:
            msg = "invalid value for parameter 'velocity'"
            print(msg)
            message["msg"] = msg
            return message

        x0 = player.get_x()
        color = player.get_color()
        arrow = Arrow(x0, 0, color)
        x = round(arrow.fire(angle, velocity));
        c = arrow.get_c();
        player.update_turn()
        print(f"[{self.__code}] Player {player.get_name()} fire a arrow from {x0} to {x}")

        for _pid, player in self.__players.items():
            if pid != _pid:
                x_diff = abs(player.get_x() - x)
                if x_diff <= 1:
                    player.hurt(100) # hp -= 100; Game over
                    print(f"\t Player {player.get_name()} is hurt {player.get_hp()} hp left")
                # elif x_diff <= 3:
                    # player.hurt(50) # hp -= 50
                    # print(f"\t Player {player.get_name()} is hurt {player.get_hp()} hp left")
        return {"msg": "success",
                "x0": x0,
                "x": x,
                "c": c,
                "color": color,
                "angle": angle,
                "velocity": velocity}


if __name__ == "__main__":
    session = Session(123456)
    _id = session.add_player("abc")
    print("All players:")
    for _pid, _player in session.get_players().items():
        print(f"{_player.get_name()}: {_player.get_pid()}")
    session.fire_arrow(str(_id), 60, 20)
    del session
