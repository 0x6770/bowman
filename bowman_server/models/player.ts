import { v4 } from "../dependents.ts";

const X_MAX = 100; // Max range on the map

const colors: Set<string> = new Set();

const generateUniqCode = (): string => {
  let color = "#" + Math.ceil(Math.random() * 16 ** 6).toString(16);
  while (colors.size < 16 ** 6) {
    if (colors.has(color)) {
      color = (Math.random() * 16 ** 6).toString(16);
    } else {
      return color;
    }
  }
  return "";
};

export class Player {
  private name: string;
  private id: string = v4.generate();
  private x = Math.ceil(X_MAX / 10 + Math.random() * X_MAX * (8 / 10)); // initial position on the map
  private hp = 100; // health point
  private color: string;

  constructor({ name }: { name: string }) {
    this.name = name;
    this.color = generateUniqCode();
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

  public getColor() {
    return this.color;
  }

  public hurt(x: number) {
    if (this.hp > 0) {
      this.hp -= x;
    }
    this.hp = this.hp < 0 ? 0 : this.hp;
    return this.hp;
  }
}
