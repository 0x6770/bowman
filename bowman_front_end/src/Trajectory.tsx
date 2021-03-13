interface Coordination {
  x: number
  y: number
}

const SCALE: number = window.innerWidth / 100

class Trajectory {
  private color: string = "#666666";
  private pos: Coordination
  private ground_level: number
  private angle: number = 45;
  private vx: number = 0;
  private vy: number = 0;
  private firing: boolean = false;
  private collided: boolean = false;
  private a = -10; // acceleration
  private t = 0.1; // time interval for each iteration
  private c: number // air drag coefficient
  window_width = window.innerWidth
  window_height = window.innerHeight

  constructor(
    x: number,
    ground_level: number,
    c: number,
    color: string
  ) {
    this.ground_level = ground_level
    this.color = color
    this.c = c
    this.pos = {
      x: Math.round(x),
      y: 0
    }
  }

  private updateAngle = () => {
    this.angle = Math.atan2(this.vy, this.vx)
  };

  private checkCollision = () => {
    if (this.firing) {
      if (this.pos.x < 0 || this.pos.x > this.window_width || this.pos.y <= 0) {
        this.collided = true
      }
    }
  };

  public update = () => {
    if (this.firing && (!this.collided)) {
      this.pos.x += this.vx * this.t
      this.pos.y += (this.a * this.t ** 2) / 2 + this.vy * this.t

      this.vx += (this.vx > 0 ? -this.c : this.c) * this.vx ** 2 * this.t
      this.vy += this.a * this.t + (this.vy > 0 ? -this.c : this.c) * this.vy ** 2 * this.t

      this.updateAngle()
      this.checkCollision()
    }
  };

  public fire = (v: number) => {
    this.firing = true
    this.vx = Math.cos(this.angle) * v
    this.vy = Math.sin(this.angle) * v
  };

  public adjustAngle = (angle: number) => {
    this.angle = (angle / 180) * Math.PI
  };

  public isCollided = (): boolean => { return this.collided }

  public isFired = (): boolean => { return this.firing }

  public getPos = () => {
    return this.pos
  }
}

export default Trajectory
