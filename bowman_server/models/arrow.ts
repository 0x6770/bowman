export class Arrow {
  private a = -10; // acceleration
  private t = 0.02; // time interval for each iteration
  private c = 0.025 + Math.ceil(Math.random() * 5) / 1000; // air drag
  private x: number;
  private y: number;
  private vx = 0.0;
  private vy = 0.0;

  constructor({ x, y }: { x: number; y: number }) {
    this.x = x;
    this.y = y;
  }

  private update() {
    //console.log(this.c, ",", this.x, ",", this.y, ",", this.vx, ",", this.vy); // print (x,y) in csv format
    this.y += (this.a * this.t ** 2) / 2 + this.vy * this.t;
    this.x += this.vx * this.t;

    this.vy +=
      this.a * this.t +
      (this.vy > 0 ? -this.c : this.c) * this.vy ** 2 * this.t;
    this.vx += (this.vx > 0 ? -this.c : this.c) * this.vx ** 2 * this.t;
  }

  public fire({ angle, velocity }: { angle: number; velocity: number }) {
    const angleInRadian = (angle / 180) * Math.PI;
    this.vx = velocity * Math.cos(angleInRadian);
    this.vy = velocity * Math.sin(angleInRadian);
  }

  public getXDistance() {
    this.update();
    while (this.y > 0) {
      this.update();
    }
    return this.x;
  }
}
