import { Request, Response } from "../dependents.ts";
import { broadcast, msgUpdatePlayers } from "./handleWs.ts";
import { Player } from "../models/player.ts";

import "../global.ts";

export const joinGame = async ({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) => {
  // validate parameters
  const { name } = await request.body().value;
  if (!name) {
    const msg = "Missing required parameters.";
    response.status = 401;
    response.body = { msg: msg };
    return;
  }
  const player: Player = new Player({ name: name });
  window.session.addPlayer(player);

  broadcast(msgUpdatePlayers());

  response.status = 200;
  response.body = {
    id: player.getId(),
    x: player.getX(),
    msg: "success",
  };
};

export const quitGame = async ({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) => {
  // validate parameters
  const { id } = await request.body().value;
  if (!id) {
    const msg = "Missing required parameters.";
    response.status = 401;
    response.body = { msg: msg };
    return;
  }

  if (!window.session.getPlayers().has(id)) {
    const msg = `Invalid parameter "id".`;
    response.status = 401;
    response.body = { msg: msg };
    return;
  }

  window.session.deletePlayer(id);

  broadcast(msgUpdatePlayers());

  response.status = 200;
  response.body = {
    msg: "success",
  };
};
