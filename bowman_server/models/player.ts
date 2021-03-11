import { v4 } from "../dependents.ts";

const X_MAX = 100; // Max range on the map

export class Player {
  private name: string;
  private id: string;
  private x = Math.ceil(Math.random() * X_MAX); // initial position on the map
  private hp = 100; // health point

  constructor({ name, id }: { name: string; id: string }) {
    if (v4.validate(id)) {
      this.name = name;
      this.id = id;
    } else {
      // deal with invalid id
      this.name = "";
      this.id = "";
      this.x = -1;
      this.hp = 0;
    }
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
    this.hp = this.hp < 0 ? 0 : this.hp;
    return this.hp;
  }
}
