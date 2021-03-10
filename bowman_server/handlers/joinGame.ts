import { Request, Response } from "https://deno.land/x/oak/mod.ts";
import { Session } from "../models/session.ts";
import { Player } from "../models/player.ts";

declare global {
  interface Window {
    sessions: Map<number, Session>;
  }
}

export const joinGame = async ({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) => {
  // validate parameters
  const { code, name } = await request.body().value;
  if (!(code && name)) {
    const msg = "Missing required parameters.";
    response.status = 401;
    response.body = { msg: msg };
    return;
  }
  console.log("JOIN GAME request:", code, name);

  // check if there is session in window.sessions
  if (window.sessions.size === 0) {
    const msg = "No game session, please start one first.";
    response.status = 400;
    response.body = { msg: msg };
    return;
  }

  // validate session code
  if (!window.sessions.has(code)) {
    const msg = "Invalid parameter: code.";
    response.status = 400;
    response.body = { msg: msg };
    return;
  }

  // Normal execution
  const player: Player = new Player({ name: name });
  //console.log(player.getId());
  window.sessions.get(code)!.addPlayer(player);
  response.status = 200;
  response.body = {
    id: player.getId(),
    x: player.getX(),
    msg: "Success",
  };
};
