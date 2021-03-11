import { Response } from "../dependents.ts";
import { Session } from "../models/session.ts";

import "../global.ts";

const codeMax = 200000;
const sessionCodes: Set<number> = new Set();

const generateUniqCode = (): number => {
  let code: number = codeMax / 2 + Math.ceil((Math.random() * codeMax) / 2);
  while (sessionCodes.size < codeMax) {
    if (sessionCodes.has(code)) {
      code = 100000 + Math.ceil(Math.random() * 100000);
    } else {
      return code;
    }
  }
  return -1;
};

export const startGame = ({ response }: { response: Response }) => {
  const code: number = generateUniqCode();
  const session: Session = new Session({ code });
  window.session = session;
  console.log("Started new Game:", code);
  response.status = 200;
  response.body = { code: code };
};
