import React from "react"
import Trajectory from "./Trajectory"
import { Canvas } from "./createCanvas"

import { ArrowStatus } from "./types"

const SCALE: number = window.innerWidth / 100

export const DrawTrajectory = ({ trajectoryData }: { trajectoryData: ArrowStatus }) => {
  const { x0, angle, velocity, color, fire, c } = trajectoryData
  const ground_level: number = 100
  const trajectory = new Trajectory(x0, ground_level, c, color)

  const draw = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, index: number) => {
    context.strokeStyle = color
    context.lineWidth = 2
    if (!trajectory.isCollided()) {
      // context.clearRect(0, 0, width, height)
      if (!trajectory.isFired()) {
        trajectory.adjustAngle(trajectoryData.angle)
        trajectory.fire(velocity)
      } else {
        let { x, y } = trajectory.getPos()
        context.beginPath()
        context.moveTo(x * SCALE, window.innerHeight - (y * SCALE + ground_level)) // y value in flipped upside down
        trajectory.update()
        x = trajectory.getPos().x
        y = trajectory.getPos().y
        context.lineTo(x * SCALE, window.innerHeight - (y * SCALE + ground_level)) // y value in flipped upside down
        context.stroke()
      }
    }
    return
  }

  return <Canvas draw={draw} style={{ zIndex: -99 }} />
}