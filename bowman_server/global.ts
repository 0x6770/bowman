import { Session } from "./models/session.ts";

declare global {
  interface Window {
    session: Session;
  }
}

interface ArrowStatus {
  x: number;
  angle: number;
  color: string;
}

interface PlayerStatus {
  name: string;
  hp: number;
  x: number;
  color: string;
}

interface wsMessage {
  method: string;
  id?: string;
  x?: number;
  angle?: number;
  c?: number;
  velocity?: number;
  color?: string;
  players?: PlayerStatus[];
  arrows?: ArrowStatus[];
  time?: Date;
  msg: string;
}

export type { ArrowStatus, PlayerStatus, wsMessage };
