import { Session } from "./models/session.ts";

declare global {
  interface Window {
    session: Session;
  }
}

interface ArrowStatus {
  x0: number;
  angle: number;
  color: string;
}

interface PlayerStatus {
  name: string;
  hp: number;
  x0: number;
  color: string;
}

interface wsMessage {
  method: "fire" | "players" | "update";
  id?: string;
  x0?: number; // original position
  x?: number; // final position
  angle?: number;
  c?: number; // air drag coefficient
  velocity?: number;
  color?: string;
  players?: PlayerStatus[];
  arrows?: ArrowStatus[];
  time?: Date;
  msg: string;
}

export type { ArrowStatus, PlayerStatus, wsMessage };
