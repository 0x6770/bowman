import { Arrow } from "./arrow.ts";

window.c = 0.035;

const arrow = new Arrow({ x: 0, y: 0 });
arrow.fire({ angle: 110, velocity: 30 });

console.log(arrow.getXDistance());
