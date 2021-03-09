import { Request, Response } from "https://deno.land/x/oak/mod.ts";
import { Player } from "../models/player.ts";

declare global {
  interface Window {
    players: Player[];
  }
}

export const createPlayer = async ({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) => {
  if (!request.hasBody) {
    const msg = "Invalid request.";
    console.error(msg);
    response.status = 400;
    response.body = {
      message: msg,
    };
    return;
  }

  const { name } = await request.body().value;

  if (!name) {
    const msg = "Missing required parameters.";
    console.error(msg);
    response.status = 401;
    response.body = { message: msg };
    return;
  }

  const player = new Player({ name: name });
  console.log("Created new player:", player.getName(), "id:", player.getId());
  window.players.push(player);
  //console.log("\nPlayers in the game:");
  //for (const [i, p] of window.players.entries()) {
  //console.log(i, ":", p.getName(), "\t", p.getId(), "\tx:", p.getX());
  //}
  response.status = 200;
  response.body = { name: player.getName(), id: player.getId() };
};
