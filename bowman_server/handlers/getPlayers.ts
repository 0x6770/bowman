import { PlayerStatus } from "../global.ts";

export const getPlayers = (): {
  msg: string;
  players: PlayerStatus[];
} => {
  // get info about players
  const players: PlayerStatus[] = Array.from(
    window.session.getPlayers().values()
  ).map((player) => {
    return {
      name: player.getName(),
      hp: player.getHp(),
      x0: player.getX(),
      color: player.getColor(),
    };
  });

  return { msg: "success", players: players };
};
