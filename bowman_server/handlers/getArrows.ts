import { ArrowStatus } from "../global.ts";

export const getArrows = (): {
  msg: string;
  arrows: ArrowStatus[];
} => {
  // get info about arrows
  const arrows: ArrowStatus[] = Array.from(
    window.session.getArrows().values()
  ).map((arrow) => {
    return {
      x0: arrow.getX(),
      angle: arrow.getAngle(),
      color: arrow.getColor(),
    };
  });

  return { msg: "success", arrows: arrows };
};
