import { Application } from "https://deno.land/x/oak/mod.ts";
import { router } from "./router.ts";
import { Player } from "./models/player.ts";

declare global {
  let players: Player[];
  const c: number;
  interface Window {
    players: Player[];
    c: number;
  }
}

window.players = [];
window.c = 0.025 + Math.ceil(Math.random() * 5) / 1000; // air drag

const app = new Application();
const port = 8080;

app.use(router.routes());
app.use(router.allowedMethods());

console.log("running on port ", port);
await app.listen({ port: port });
