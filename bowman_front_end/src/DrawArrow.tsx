import React from "react"
import Arrow from "./Arrow"
import { Canvas } from "./createCanvas"
import { ArrowStatus } from "./types"

const width = window.innerWidth
const height = window.innerHeight

export const DrawArrow = ({ arrowData }: { arrowData: ArrowStatus }) => {
  const { x0, angle, velocity, color, fire, c } = arrowData
  const ground_level: number = 100
  const arrowX = new Arrow(x0, ground_level, c, color)

  const draw = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, index: number) => {
    if (!arrowX.isCollided()) {
      context.clearRect(0, 0, width, height)
      if (fire) {
        if (!arrowX.isFired()) {
          arrowX.adjustAngle(arrowData.angle)
          arrowX.fire(velocity)
        }
        arrowX.update()
        arrowX.render(context)
      } else {
        arrowX.adjustAngle(arrowData.angle)
        arrowX.render(context)
      }
    }
    return
  }

  return <Canvas draw={draw} style={{ zIndex: -1 }} />
}