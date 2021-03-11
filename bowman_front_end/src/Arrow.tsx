interface Coord {
  x: number
  y: number
}

const SCALE: number = window.innerWidth / 100

class Arrow {
  private color: string = "#666666";
  private length: number = 40;
  // private tip: Coord
  private tail: Coord
  private ground_level: number
  private angle: number = 45;
  private vx: number = 0;
  private vy: number = 0;
  private firing: boolean = false;
  private collided: number = 0;
  private a = -10; // acceleration
  private t = 0.02; // time interval for each iteration
  private c = 0.025 + Math.ceil(Math.random() * 5) / 1000; // air drag

  constructor(
    x: number,
    ground_level: number,
    color: string
  ) {
    console.log(`SCALE: ${SCALE}`)
    this.ground_level = ground_level
    this.color = color
    this.tail = {
      x: Math.round(x),
      y: 0
    }
    // this.tip = {
    //   x: Math.round(x + this.length * Math.cos(this.angle)),
    //   y: Math.round(0 + this.length * Math.sin(this.angle))
    // }
  }

  private updateAngle = () => {
    this.angle = Math.atan2(this.vy, this.vx)
  };

  // TODO: use tip position to check collision
  private checkCollision = (window_width: number, window_height: number) => {
    if (this.firing) {
      const tipx = this.tail.x + this.length * Math.cos(this.angle)
      const tipy = this.tail.y + this.length * Math.sin(this.angle)
      if (this.tail.x < 0 || this.tail.x > window_width || this.tail.y <= 0) {
        this.collided = 1
      }
    }
  };

  private update = (window_width: number, window_height: number) => {
    if (this.firing && (!this.collided)) {
      this.tail.x += this.vx * this.t
      this.tail.y += (this.a * this.t ** 2) / 2 + this.vy * this.t

      this.vx += (this.vx > 0 ? -this.c : this.c) * this.vx ** 2 * this.t
      this.vy += this.a * this.t + (this.vy > 0 ? -this.c : this.c) * this.vy ** 2 * this.t

      this.updateAngle()
      // this.tip = {
      //   x: this.tail.x + this.length * Math.cos(this.angle),
      //   y: this.tail.y + this.length * Math.sin(this.angle)
      // }
      this.checkCollision(window_width, window_height)
    }
  };

  public print = () => {
    console.log("====================")
    console.log("Print Arrow")
    console.log("color: ", this.color)
    console.log("length: ", this.length)
    // console.log(`tip {x: ${this.tip.x}, y: ${this.tip.y}}`)
    console.log(`tail {x: ${this.tail.x}, y: ${this.tail.y}}`)
  };

  public fire = (v: number) => {
    this.firing = true
    this.vx = Math.cos(this.angle) * v
    this.vy = Math.sin(this.angle) * v
  };

  public adjustAngle = (angle: number) => {
    console.log(`angle: ${angle}`)
    if (!this.firing) {
      this.angle = (angle / 180) * Math.PI
      // this.tip = {
      //   x: this.tail.x + this.length * Math.cos(this.angle),
      //   y: this.tail.y + this.length * Math.sin(this.angle)
      // }
    }
  };


  public render = (context: CanvasRenderingContext2D, window_width: number, window_height: number): number => {
    if ((!this.collided) && context) {
      this.update(window_width, window_height)
    }
    if (context) {
      console.log(this.tail.x, this.tail.y)
      context.save()

      context.beginPath()
      context.moveTo(this.tail.x * SCALE, window.innerHeight - (this.tail.y * SCALE + this.ground_level)) // y value in flipped upside down
      context.lineTo(this.tail.x * SCALE + this.length * Math.cos(this.angle) / 2, window.innerHeight - (this.tail.y * SCALE + this.length * Math.sin(this.angle) / 2 + this.ground_level))
      context.lineWidth = 3
      context.strokeStyle = "blue"
      context.stroke()

      context.beginPath()
      context.moveTo(this.tail.x * SCALE + this.length * Math.cos(this.angle) / 2, window.innerHeight - (this.tail.y * SCALE + this.length * Math.sin(this.angle) / 2 + this.ground_level))
      context.lineTo(this.tail.x * SCALE + this.length * Math.cos(this.angle), window.innerHeight - (this.tail.y * SCALE + this.length * Math.sin(this.angle) + this.ground_level))
      context.lineWidth = 3
      context.strokeStyle = this.color
      context.stroke()

      context.restore()
    }
    return this.collided
  };
}

// ((this.tail.y - this.ground_level) * SCALE + this.ground_level)
export default Arrow
