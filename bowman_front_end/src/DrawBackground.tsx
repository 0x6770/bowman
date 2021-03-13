import React from "react"
import { Canvas } from "./createCanvas"


interface BackgroundCanvasProps {
  width: number
  height: number
}

export const BackgroundCanvas = ({ width, height }: BackgroundCanvasProps) => {
  const ground_level: number = 100

  const draw = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, index: number) => {
    context.fillStyle = "#333333"
    context.fillRect(0, height - ground_level, width, ground_level)
  }

  return (
    <Canvas draw={draw} style={{ zIndex: -99 }} />
  )
}

BackgroundCanvas.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
}
