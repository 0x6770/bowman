import { Request, Response } from "../dependents.ts";
import "../global.ts";

// valid range for velocity and angle
const VMIN = 0;
const VMAX = 100;
const AMIN = 0;
const AMAX = 180;

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

  const { code, id, angle, velocity } = await request.body().value;

  // check if request has required parameters
  if (!(code && id && angle && velocity)) {
    const msg = "Missing required parameters.";
    console.error(msg);
    response.status = 401;
    response.body = { msg: msg };
    return;
  }

  // validate angle
  if (angle > AMAX || angle < AMIN) {
    const msg =
      "Invalid value for `angle`, should between " + AMIN + " and " + AMAX;
    console.error(msg);
    response.status = 401;
    response.body = { message: msg };
    return;
  }

  // validate velocity
  if (velocity > VMAX || velocity < VMIN) {
    const msg =
      "Invalid value for `velocity`, should between " + VMIN + " and " + VMAX;
    console.error(msg);
    response.status = 401;
    response.body = { message: msg };
    return;
  }

  // validate `id` and fire an arrow if success
  const { msg, x } = window.session.fireArrow({
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

  response.status = 200;
  response.body = { x: x };
};
