import { Router } from "./dependents.ts";

import { fire } from "./handlers/fireArrow.ts";
import { handleWs } from "./handlers/handleWs.ts";

export const router = new Router();

router.post("/fire", fire);
router.get("/ws", async (ctx) => {
  const sock = await ctx.upgrade();
  handleWs(sock);
});
