import { Player } from "../models/player.ts";

import "../global.ts";

export const joinGame = ({
  name,
  id,
}: {
  name: string;
  id: string;
}): { x: number; msg: string } => {
  // Normal execution
  const player: Player = new Player({ name: name, id: id });
  window.session.addPlayer(player);
  return { x: player.getX(), msg: "success" };
};
