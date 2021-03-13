interface Coordination {
  x: number
  y: number
}

const SCALE: number = window.innerWidth / 100

class Arrow {
  private color: string = "#666666";
  private length: number = 40;
  private tail: Coordination
  private ground_level: number
  private angle: number = 45;
  private vx: number = 0;
  private vy: number = 0;
  private firing: boolean = false;
  private collided: boolean = false;
  private a = -10; // acceleration
  private t = 0.02; // time interval for each iteration
  private c: number
  // private c = 0.025 + Math.ceil(Math.random() * 5) / 1000; // air drag
  window_width = window.innerWidth
  window_height = window.innerHeight

  constructor(
    x: number,
    ground_level: number,
    c: number,
    color: string
  ) {
    // console.log(`SCALE: ${SCALE}`)
    this.ground_level = ground_level
    this.color = color
    this.c = c
    this.tail = {
      x: Math.round(x),
      y: 0
    }
  }

  private updateAngle = () => {
    this.angle = Math.atan2(this.vy, this.vx)
  };

  private checkCollision = () => {
    if (this.firing) {
      if (this.tail.x < 0 || this.tail.x > this.window_width || this.tail.y <= 0) {
        this.collided = true
      }
    }
  };

  public update = () => {
    if (this.firing && (!this.collided)) {
      this.tail.x += this.vx * this.t
      this.tail.y += (this.a * this.t ** 2) / 2 + this.vy * this.t

      this.vx += (this.vx > 0 ? -this.c : this.c) * this.vx ** 2 * this.t
      this.vy += this.a * this.t + (this.vy > 0 ? -this.c : this.c) * this.vy ** 2 * this.t

      this.updateAngle()
      this.checkCollision()
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
    // console.log(`angle: ${angle}`)
    this.angle = (angle / 180) * Math.PI
  };

  public isCollided = (): boolean => { return this.collided }

  public isFired = (): boolean => { return this.firing }

  public render = (context: CanvasRenderingContext2D) => {
    if (!this.collided) {
      context.save()

      context.lineWidth = 3
      context.strokeStyle = "black"
      context.beginPath()
      context.moveTo(this.tail.x * SCALE, window.innerHeight - (this.tail.y * SCALE + this.ground_level)) // y value in flipped upside down
      context.lineTo(this.tail.x * SCALE + this.length * Math.cos(this.angle) * 0.9, window.innerHeight - (this.tail.y * SCALE + this.length * Math.sin(this.angle) * 0.9 + this.ground_level))
      context.stroke()

      context.beginPath()
      context.moveTo(this.tail.x * SCALE + this.length * Math.cos(this.angle) * 0.9, window.innerHeight - (this.tail.y * SCALE + this.length * Math.sin(this.angle) * 0.9 + this.ground_level))
      context.lineTo(this.tail.x * SCALE + this.length * Math.cos(this.angle), window.innerHeight - (this.tail.y * SCALE + this.length * Math.sin(this.angle) + this.ground_level))
      context.strokeStyle = this.color
      context.stroke()

      context.restore()
    }
  };
}

export default Arrow
