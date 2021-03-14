import { isWebSocketCloseEvent, WebSocket, v4 } from "../dependents.ts";
import { getPlayers } from "./getPlayers.ts";
import { getArrows } from "./getArrows.ts";

import { wsMessage } from "../global.ts";

const socks: Map<string, { isPlayer: boolean; sock: WebSocket }> = new Map();

export const broadcast = (msg: wsMessage): void => {
  for (const item of socks.values()) {
    const { sock } = item;
    sock.send(JSON.stringify(msg));
  }
};

export const msgUpdatePlayers = (): wsMessage => {
  const { players } = getPlayers();
  const { arrows } = getArrows();
  const message: wsMessage = {
    method: "update",
    players: players,
    arrows: arrows,
    msg: "success",
  };
  return message;
};

export const handleWs = async (sock: WebSocket) => {
  const playerId: string = v4.generate();
  socks.set(playerId, { isPlayer: false, sock: sock });
  try {
    for await (const ev of sock) {
      if (typeof ev === "string") {
        const { method } = JSON.parse(ev);
        switch (method) {
          case "players": {
            await sock.send(JSON.stringify(msgUpdatePlayers()));
            break;
          }
          default: {
            const msg = { code: 0, msg: "unknown method" };
            console.error(msg);
            await sock.send(JSON.stringify(msg));
            break;
          }
        }
      } else if (isWebSocketCloseEvent(ev)) {
        // close
        const { code, reason } = ev;
        socks.delete(playerId);
        window.session.deletePlayer(playerId);
        broadcast(msgUpdatePlayers());
        console.log("ws:Close", code, reason);
      }
    }
  } catch (err) {
    console.error(`failed to receive frame: ${err}`);

    if (!sock.isClosed) {
      await sock.close(1000).catch(console.error);
    }
  }
};
