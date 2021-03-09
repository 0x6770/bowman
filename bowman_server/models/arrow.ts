declare global {
  interface Window {
    c: number;
  }
}

export class Arrow {
  private a = -10; // acceleration
  private t = 0.02; // time interval for each iteration
  private c = window.c; // drag
  private x: number;
  private y: number;
  private vx = 0.0;
  private vy = 0.0;

  constructor({ x, y }: { x: number; y: number }) {
    this.x = x;
    this.y = y;
  }

  private update() {
    this.y += (this.a * this.t ** 2) / 2 + this.vy * this.t;
    this.x += this.vx * this.t;

    this.vy +=
      this.a * this.t +
      (this.vy > 0 ? -this.c * this.vy ** 2 : this.c * this.vy ** 2) * this.t;
    this.vx += -this.c * this.vx * this.vx * this.t;
    //console.log(this.x, ",", this.y); // print (x,y) in csv format
  }

  public fire({ angle, velocity }: { angle: number; velocity: number }) {
    const angleInDegree = (angle / 180) * Math.PI;
    this.vx = velocity * Math.cos(angleInDegree);
    this.vy = velocity * Math.sin(angleInDegree);
  }

  public getXDistance() {
    this.update();
    while (this.y > 0) {
      this.update();
    }
    return this.x;
  }
}
