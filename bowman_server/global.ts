import { Session } from "./models/session.ts";

declare global {
  interface Window {
    session: Session;
  }
}
