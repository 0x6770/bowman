import { isWebSocketCloseEvent, WebSocket, v4 } from "../dependents.ts";
import { joinGame } from "./joinGame.ts";
import { getPlayers } from "./getPlayers.ts";
import { getArrows } from "./getArrows.ts";

import { wsMessage } from "../global.ts";

const socks: Map<string, { isPlayer: boolean; sock: WebSocket }> = new Map();

const broadcast = (msg: wsMessage): void => {
  for (const item of socks.values()) {
    const { sock } = item;
    sock.send(JSON.stringify(msg));
  }
};

const msgUpdatePlayers = (): wsMessage => {
  const { players } = getPlayers();
  const { arrows } = getArrows();
  const message = {
    method: "update",
    players: players,
    arrows: arrows,
    msg: "success",
  };
  return message;
};

export const handleWs = async (sock: WebSocket) => {
  //console.log("socket connected!");
  const playerId: string = v4.generate();
  socks.set(playerId, { isPlayer: false, sock: sock });
  try {
    for await (const ev of sock) {
      if (typeof ev === "string") {
        // text message
        //console.log("ws:Text", ev);
        const { method, params } = JSON.parse(ev);
        switch (method) {
          case "join": {
            const { name } = params;
            const { x, msg } = joinGame({
              name: name,
              id: playerId,
            });
            socks.get(playerId)!.isPlayer = true;
            const { players } = getPlayers();
            let message: wsMessage;
            if (msg === "success") {
              message = {
                method: "join",
                id: playerId,
                x: x,
                players: players,
                msg: "success",
              };
              await sock.send(JSON.stringify(message));
              broadcast(msgUpdatePlayers());
            } else {
              message = { method: "join", msg: "fail" };
              await sock.send(JSON.stringify(message));
            }
            break;
          }
          case "players": {
            await sock.send(JSON.stringify(msgUpdatePlayers()));
            break;
          }
          case "angle": {
            const { id, angle } = params;
            if (socks.has(id) && angle) {
              if (socks.get(id)!.isPlayer) {
                window.session.getArrows().get(id)!.changeAngle(angle);
                broadcast(msgUpdatePlayers());
              }
            }
            break;
          }
          case "fire": {
            const { id, angle, velocity } = params;
            if (socks.has(id) && angle && velocity) {
              if (socks.get(id)!.isPlayer) {
                const { c, msg } = window.session.fireArrow({
                  id: id,
                  angle: angle,
                  velocity: velocity,
                });
                if (msg == "success") {
                  //console.log(
                  //`${window.session
                  //.getPlayers()
                  //.get(id)!
                  //.getName()} shoot an arrow`
                  //);
                  broadcast(msgUpdatePlayers());
                  const reply: wsMessage = {
                    method: "fire",
                    x: window.session.getPlayers().get(id)!.getX(),
                    c: c,
                    angle: angle,
                    velocity: velocity,
                    color: window.session.getPlayers().get(id)!.getColor(),
                    time: new Date(),
                    msg: "success",
                  };
                  broadcast(reply);
                }
              }
            }
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
