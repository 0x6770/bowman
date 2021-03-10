import { Router } from "https://deno.land/x/oak/mod.ts";

import { fire } from "./handlers/fireArrow.ts";
import { getPlayers } from "./handlers/getPlayers.ts";
import { startGame } from "./handlers/startGame.ts";
import { joinGame } from "./handlers/joinGame.ts";

export const router = new Router();

router
  .post("/", joinGame)
  .post("/start", startGame)
  .get("/players", getPlayers)
  .post("/fire", fire);
