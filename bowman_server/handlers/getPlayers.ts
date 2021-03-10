import { Request, Response } from "https://deno.land/x/oak/mod.ts";
import { Session } from "../models/session.ts";

declare global {
  interface Window {
    sessions: Map<number, Session>;
  }
}

interface PlayerStatus {
  name: string;
  hp: number;
  x: number;
}

export const getPlayers = async ({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) => {
  let playerStatus: PlayerStatus[] = [];

  // check if request has a body
  if (!request.hasBody) {
    const msg = "No body found in request.";
    response.status = 400;
    response.body = { msg: msg };
    return;
  }

  const { code } = await request.body().value;

  // check if request has required parameters
  if (!code) {
    const msg = "Missing required parameters.";
    console.error(msg);
    response.status = 401;
    response.body = { msg: msg };
    return;
  }

  if (!window.sessions.has(code)) {
    const msg = "Invalid code";
    console.error(msg);
    response.status = 401;
    response.body = { msg: msg };
    return;
  }

  // get info about players
  window.sessions
    .get(code)!
    .getPlayers()
    .forEach((player) => {
      playerStatus.push({
        name: player.getName(),
        hp: player.getHp(),
        x: player.getX(),
      });
    });

  response.status = 200;
  response.body = playerStatus;
};
