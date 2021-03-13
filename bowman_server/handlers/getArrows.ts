import { ArrowStatus } from "../global.ts";

export const getArrows = (): {
  msg: string;
  arrows: ArrowStatus[];
} => {
  let arrows: ArrowStatus[] = [];

  // get info about arrows
  window.session.getArrows().forEach((arrow) => {
    arrows.push({
      x: arrow.getX(),
      angle: arrow.getAngle(),
      color: arrow.getColor(),
    });
  });

  return { msg: "success", arrows: arrows };
};
