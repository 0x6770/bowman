import { Application } from "./dependents.ts";
import { router } from "./router.ts";
import { Session } from "./models/session.ts";

window.session = new Session({ code: 123456 });

const app = new Application();
const port = 8080;

app.use(router.routes());
app.use(router.allowedMethods());

// Error handler middleware
app.use(async (context, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);
  }
});

// Send static content
app.use(async (context, next) => {
  const root = `${Deno.cwd()}/public`;
  try {
    await context.send({ root: root, index: "index.html" });
  } catch {
    next();
  }
});

console.log("running on port ", port);
await app.listen({ port: port });
