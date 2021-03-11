import { Application } from "./dependents.ts";
import { router } from "./router.ts";
import { Session } from "./models/session.ts";

window.session = new Session({ code: 123456 });

const app = new Application();
const port = 8080;

app.use(router.routes());
app.use(router.allowedMethods());

console.log("running on port ", port);
await app.listen({ port: port });
