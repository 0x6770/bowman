import { Router } from "./dependents.ts";

import { fire } from "./handlers/fireArrow.ts";
import { adjustAngle } from "./handlers/adjustAngle.ts";
import { joinGame, quitGame } from "./handlers/joinGame.ts";
import { handleWs } from "./handlers/handleWs.ts";

export const router = new Router();

router
  .post("/angle", adjustAngle)
  .post("/join", joinGame)
  .post("/quit", quitGame)
  .post("/fire", fire)
  .get("/ws", async (ctx) => {
    const sock = await ctx.upgrade();
    handleWs(sock);
  });
