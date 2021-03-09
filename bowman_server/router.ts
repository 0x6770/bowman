import { Router } from "https://deno.land/x/oak/mod.ts";

import { fireArrow } from "./handlers/fireArrow.ts";
import { createPlayer } from "./handlers/createPlayer.ts";
import { getPlayers } from "./handlers/getPlayers.ts";
//import getUserDetails from "./handlers/getUserDetails.ts";
//import updateUser from "./handlers/updateUser.ts";
//import deleteUser from "./handlers/deleteUser.ts";

export const router = new Router();

router
  .post("/players", createPlayer)
  .get("/getPlayers", getPlayers)
  .get("/fire", fireArrow);
//.get("/users/:id", getUserDetails)
//.put("/users/:id", updateUser)
//.delete("/users/:id", deleteUser);
