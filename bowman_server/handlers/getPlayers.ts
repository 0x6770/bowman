import "../global.ts";

interface PlayerStatus {
  name: string;
  hp: number;
  x: number;
}

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
    });
  });

  return { msg: "success", players: players };
};
