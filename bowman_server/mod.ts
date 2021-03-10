import { Application } from "https://deno.land/x/oak/mod.ts";
import { router } from "./router.ts";
import { Session } from "./models/session.ts";

declare global {
  interface Window {
    sessions: Map<number, Session>;
  }
}

window.sessions = new Map();

const app = new Application();
const port = 8080;

app.use(router.routes());
app.use(router.allowedMethods());

console.log("running on port ", port);
await app.listen({ port: port });
