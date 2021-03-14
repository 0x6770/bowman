import { Request, Response } from "../dependents.ts";
import { broadcast, msgUpdatePlayers } from "./handleWs.ts";
import { wsMessage } from "../global.ts";

// valid range for velocity and angle
const angleMin = 0;
const angleMax = 180;
const velocityMin = 0;
const velocityMax = 180;

export const fire = async ({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) => {
  // check if request has a body
  if (!request.hasBody) {
    const msg = "No body found in request.";
    console.error(msg);
    response.status = 400;
    response.body = {
      msg: msg,
    };
    return;
  }

  const { id, angle, velocity } = await request.body().value;

  // check if request has required parameters
  if (!(id && angle && velocity)) {
    const msg = "Missing required parameters.";
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

  // validate velocity
  if (velocity > velocityMax || velocity < velocityMin) {
    const msg = `Invalid value for "velocity", should between ${velocityMin} and ${velocityMax}`;
    console.error(msg);
    response.status = 401;
    response.body = { message: msg };
    return;
  }

  // validate `id` and fire an arrow if success
  const { msg, x0, x, c, color } = window.session.fireArrow({
    id: id,
    angle: angle,
    velocity: velocity,
  });

  if (msg === "Invalid id") {
    const msg = "Invalid parameter `id`.";
    console.error(msg);
    response.status = 401;
    response.body = { message: msg };
    return;
  } else if (msg === "Player died") {
    const msg = "You have 0 HP, cannot shoot.";
    console.error(msg);
    response.status = 401;
    response.body = { message: msg };
    return;
  }

  const broadcastMsg: wsMessage = {
    method: "fire",
    msg: "success",
    x0: x0,
    x: x,
    angle: angle,
    velocity: velocity,
    c: c,
    color: color,
    time: new Date(),
  };

  broadcast(broadcastMsg);
  broadcast(msgUpdatePlayers());

  response.status = 200;
  response.body = { msg: "success", x: x };
};
