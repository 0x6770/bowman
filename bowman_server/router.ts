import { Router } from "./dependents.ts";

import { fire } from "./handlers/fireArrow.ts";
//import { getPlayers } from "./handlers/getPlayers.ts";
import { startGame } from "./handlers/startGame.ts";
//import { joinGame } from "./handlers/joinGame.ts";
import { handleWs } from "./handlers/handleWs.ts";
import { sendIndex } from "./handlers/sendIndex.ts";

export const router = new Router();

router
  .get("/", sendIndex)
  //.post("/join", joinGame)
  //.post("/start", startGame)
  //.get("/players", getPlayers)
  .post("/fire", fire)
  .get("/ws", async (ctx) => {
    const sock = await ctx.upgrade();
    handleWs(sock);
  });
