import { Request, Response } from "https://deno.land/x/oak/mod.ts";
import { Player } from "../models/player.ts";
import { Arrow } from "../models/arrow.ts";
import { v4 } from "https://deno.land/std@0.89.0/uuid/mod.ts";

declare global {
  interface Window {
    players: Player[];
  }
}

// return `x` of player if `id` is valid
// return -1 if id is invalid
const checkId = (id: string): number => {
  if (!v4.validate(id)) return -1;
  for (const player of window.players) {
    if (player.getId() == id) return player.getX();
  }
  return -1;
};

const checkShot = (x: number) => {
  for (const player of window.players) {
    const xDiff = Math.abs(player.getX() - x);
    if (xDiff < 10) {
      player.hurt(100); // game over
      //console.log(player.getName(), "is shot, -100");
    } else if (xDiff < 15) {
      player.hurt(50);
      //console.log(player.getName(), "is shot, -50");
    }
  }
};

export const fireArrow = async ({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) => {
  let x0: number; // position of self;

  if (!request.hasBody) {
    const msg = "No body found in request.";
    console.error(msg);
    response.status = 400;
    response.body = {
      message: msg,
    };
    return;
  }

  const { id, angle, velocity } = await request.body().value;

  if (!(id && angle && velocity)) {
    const msg = "Missing required parameters.";
    console.error(msg);
    response.status = 401;
    response.body = { message: msg };
    return;
  }

  x0 = checkId(id);
  if (x0 < 0) {
    const msg = "ID provided is invalid.";
    console.error(msg);
    response.status = 402;
    response.body = { message: msg };
    return;
  }

  const arrow = new Arrow({ x: x0, y: 0 });
  arrow.fire({ angle: angle, velocity: velocity });
  const x = Math.round(arrow.getXDistance());
  checkShot(x);
  console.log("Arrow from", id, "fell at", x, "in x axis.");
  response.status = 200;
  response.body = { id: id, x_distance: x };

  for (const [i, p] of window.players.entries()) {
    console.log(
      i,
      ":",
      p.getName(),
      "\t",
      p.getId(),
      "\tx:",
      p.getX(),
      "\thp:",
      p.getHp()
    );
  }
};
