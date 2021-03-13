export class Arrow {
  private a = -10; // acceleration
  private t = 0.02; // time interval for each iteration
  private c = 0.025 + Math.ceil(Math.random() * 5) / 1000; // air drag
  private x: number;
  private y: number;
  private vx = 0.0;
  private vy = 0.0;
  private angle = 45;
  private color: string;

  constructor({ x, y, color }: { x: number; y: number; color: string }) {
    this.x = x;
    this.y = y;
    this.color = color;
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

  // used to give feed back when adjusting angle
  public changeAngle(angle: number) {
    this.angle = angle;
  }

  public fire({ angle, velocity }: { angle: number; velocity: number }) {
    const angleInRadian = (angle / 180) * Math.PI;
    this.vx = velocity * Math.cos(angleInRadian);
    this.vy = velocity * Math.sin(angleInRadian);
  }

  public getX() {
    return this.x;
  }

  public getAngle() {
    return this.angle;
  }

  public getColor() {
    return this.color;
  }

  public getC() {
    return this.c;
  }

  // return the final value of x after flight
  public getXDistance() {
    this.update();
    while (this.y > 0) {
      this.update();
    }
    return this.x;
  }
}
