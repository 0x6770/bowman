import { v4, assert } from "../dependents.ts";
import { Player } from "./player.ts";
import { Arrow } from "./arrow.ts";

export class Session {
  private code: number;
  private players: Map<string, Player> = new Map();
  private arrows: Map<string, Arrow> = new Map();

  constructor({ code }: { code: number }) {
    this.code = code;
  }

  public addPlayer(player: Player) {
    console.log(
      `Player ${player.getName()} joined game, id: ${player.getId()}`
    );
    this.players.set(player.getId(), player);
    this.arrows.set(
      player.getId(),
      new Arrow({ x: player.getX(), y: 0, color: player.getColor() })
    );
  }

  public deletePlayer(id: string) {
    console.log(
      `Player ${this.players.get(id)!.getName()} quit game, id: ${id}`
    );
    this.players.delete(id);
    this.arrows.delete(id);
  }

  public getPlayers() {
    return this.players;
  }

  public getArrows() {
    return this.arrows;
  }

  // return `x` of player if `id` is valid
  // return -1 if id is invalid
  private checkId = (id: string): number => {
    if (v4.validate(id) && this.players.has(id)) {
      return 0;
    }
    assert(this.players.has(id));
    return 1;
  };

  public fireArrow({
    id,
    angle,
    velocity,
  }: {
    id: string;
    angle: number;
    velocity: number;
  }): { msg: string; x0: number; x: number; c: number; color: string } {
    if (this.checkId(id)) {
      console.error("Invalid ID.");
      return { msg: "Invalid id", x0: 0, x: 0, c: 0, color: "" };
    }
    if (this.players.get(id)!.getHp() == 0) {
      console.error("Player has 0 HP, cannot fire.");
      return { msg: "Player died", x0: 0, x: 0, c: 0, color: "" };
    }

    const x0 = this.players.get(id)!.getX();
    const color = this.players.get(id)!.getColor();
    const arrow = new Arrow({
      x: x0,
      y: 0,
      color: color,
    });
    arrow.fire({ angle: angle, velocity: velocity });
    const x = Math.round(arrow.getXDistance());
    const c = arrow.getC();
    //console.log(`air drag coefficient c: ${c}`);
    console.log(
      `[${this.code}] Player ${this.players
        .get(id)!
        .getName()} fire a arrow from ${x0} to ${x}`
    );

    for (const [pid, player] of this.players) {
      // comment the `if statement` to allow one to hurt himself
      if (id != pid) {
        const xDiff = Math.abs(player.getX() - x);
        if (xDiff <= 1) {
          player.hurt(100); // hp -= 100; Game over
          console.log(
            `\t Player ${player.getName()} is hurt ${player.getHp()} hp left`
          );
        } else if (xDiff <= 3) {
          player.hurt(50); // hp -= 50
          console.log(
            `\t Player ${player.getName()} is hurt ${player.getHp()} hp left`
          );
        }
      }
    }
    return { msg: "success", x0: x0, x: x, c: c, color: color };
  }
}
