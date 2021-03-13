import { PlayerStatus } from "../global.ts";

export const getPlayers = (): {
  msg: string;
  players: PlayerStatus[];
} => {
  let players: PlayerStatus[] = [];

  // get info about players
  window.session.getPlayers().forEach((player) => {
    players.push({
      name: player.getName(),
      hp: player.getHp(),
      x: player.getX(),
      color: player.getColor(),
    });
  });

  return { msg: "success", players: players };
};
