import { v4 } from "https://deno.land/std@0.89.0/uuid/mod.ts";

const X_MAX = 100; // Max range on the map

export class Player {
  private name: string;
  private id = v4.generate();
  private x = Math.ceil(Math.random() * X_MAX); // initial position on the map
  private hp = 100; // health point

  constructor({ name }: { name: string }) {
    this.name = name;
  }

  public getName() {
    return this.name;
  }

  public getId() {
    return this.id;
  }

  public getX() {
    return this.x;
  }

  public getHp() {
    return this.hp;
  }

  public hurt(x: number) {
    if (this.hp > 0) {
      this.hp -= x;
    }
    return this.hp;
  }
}
