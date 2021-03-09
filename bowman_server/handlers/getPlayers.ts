import { Response } from "https://deno.land/x/oak/mod.ts";
import { Player } from "../models/player.ts";

declare global {
  interface Window {
    players: Player[];
  }
}

interface PlayerStatus {
  name: string;
  hp: number;
  x: number;
}

export const getPlayers = ({ response }: { response: Response }) => {
  let playerStatus: PlayerStatus[] = [];
  for (const player of window.players) {
    playerStatus.push({
      name: player.getName(),
      hp: player.getHp(),
      x: player.getX(),
    });
  }
  response.status = 200;
  response.body = { playerStatus };
};
