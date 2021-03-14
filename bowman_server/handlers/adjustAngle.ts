import { Request, Response } from "../dependents.ts";
import { broadcast, msgUpdatePlayers } from "./handleWs.ts";
import "../global.ts";

// valid range for and angle
const angleMin = 0;
const angleMax = 180;

export const adjustAngle = async ({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) => {
  // check if request has a body
  if (!request.hasBody) {
    const msg = `No body found in request.`;
    console.error(msg);
    response.status = 400;
    response.body = {
      msg: msg,
    };
    return;
  }

  const { id, angle } = await request.body().value;

  // check if request has required parameters
  if (!(id && angle)) {
    const msg = `Missing required parameters.`;
    console.error(msg);
    response.status = 401;
    response.body = { msg: msg };
    return;
  }

  // validate angle
  if (angle > angleMax || angle < angleMin) {
    const msg = `Invalid value for "angle", should between ${angleMin} and ${angleMax}`;
    console.error(msg);
    response.status = 401;
    response.body = { message: msg };
    return;
  }

  // validate id
  if (!window.session.getPlayers().has(id)) {
    const msg = `Invalid parameter "id".`;
    console.error(msg);
    response.status = 401;
    response.body = { message: msg };
    return;
  }

  window.session.getArrows().get(id)!.changeAngle(angle);
  broadcast(msgUpdatePlayers());

  response.status = 200;
  response.body = { msg: "success" };
};
