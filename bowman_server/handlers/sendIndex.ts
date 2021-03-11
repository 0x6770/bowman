import { Response } from "../dependents.ts";

export const sendIndex = async ({ response }: { response: Response }) => {
  const decoder = new TextDecoder("utf-8");
  const bytes = await Deno.readFile("index.html");
  const text = decoder.decode(bytes);
  response.status = 200;
  response.headers = new Headers({
    "content-type": "text/html",
  });
  response.body = text;
};
