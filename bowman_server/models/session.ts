import { v4, assert } from "../dependents.ts";
import { Player } from "./player.ts";
import { Arrow } from "./arrow.ts";

export class Session {
  private code: number;
  private players: Map<string, Player> = new Map();

  constructor({ code }: { code: number }) {
    this.code = code;
  }

  public addPlayer(player: Player) {
    console.log(`${player.getName()} joined game`);
    this.players.set(player.getId(), player);
  }

  public deletePlayer(id: string) {
    console.log(`${this.players.get(id)!.getName()} quit game`);
    this.players.delete(id);
  }

  public getPlayers() {
    return this.players;
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
  }): { msg: string; x: number } {
    if (this.checkId(id)) {
      console.error("Invalid ID.");
      return { msg: "Invalid id", x: 0 };
    }
    if (this.players.get(id)!.getHp() == 0) {
      console.error("Player has 0 HP, cannot fire.");
      return { msg: "Player died", x: 0 };
    }

    const x0 = this.players.get(id)!.getX();
    const arrow = new Arrow({ x: x0, y: 0 });
    arrow.fire({ angle: angle, velocity: velocity });
    const x = Math.round(arrow.getXDistance());

    console.log(
      "[",
      this.code,
      "] Player",
      this.players.get(id)!.getName(),
      "fire a arrow from",
      x0,
      "to",
      x
    );

    for (const [pid, player] of this.players) {
      // comment the `if statement` to allow one to hurt himself
      if (id != pid) {
        const xDiff = Math.abs(player.getX() - x);
        if (xDiff < 5) {
          player.hurt(100); // hp -= 100; Game over
          console.log(
            "[",
            this.code,
            "] >> Player",
            player.getName(),
            "is hurt,",
            player.getHp(),
            "hp left"
          );
        } else if (xDiff < 10) {
          player.hurt(50); // hp -= 50
          console.log(
            "[",
            this.code,
            "] >> Player",
            player.getName(),
            "is hurt,",
            player.getHp(),
            "hp left"
          );
        }
      }
    }
    return { msg: "success", x: x };
  }
}