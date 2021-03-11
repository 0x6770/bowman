import React, { useState, useRef, useEffect, useMemo } from "react"
import Arrow from "./Arrow"

interface CanvasProps {
  width: number
  height: number
  angle: number
  velocity: number
  fire: boolean
}

const Canvas = ({ width, height, angle, velocity, fire }: CanvasProps) => {
  let thisfire: boolean = fire
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ground_level: number = 100
  const canvas = canvasRef.current
  const context:
    | CanvasRenderingContext2D
    | undefined
    | null = canvas?.getContext("2d")
  const [arrows, setArrows] = useState<Arrow[]>([
    new Arrow(20, ground_level, "red"),
  ])

  console.log(arrows.length)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!thisfire) {
      arrows[arrows.length - 1].adjustAngle(angle)
      if (context) {
        context.clearRect(0, 0, width, height)
        arrows[arrows.length - 1].render(context, width, height)
      }
    }
  }, [angle])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    let id: number
    console.log(`thisfire: ${thisfire}`)
    if (thisfire) {
      arrows[arrows.length - 1].fire(velocity)
      const render = () => {
        if (context) {
          context.clearRect(0, 0, width, height)
          if (arrows[arrows.length - 1].render(context, width, height) == 1) {
            console.log("returning")
            cancelAnimationFrame(id)
            setArrows([...arrows, new Arrow(20, ground_level, "black")])
            thisfire = false
            return
          }
          id = requestAnimationFrame(render)
        }
      }
      render()
    }
  }, [thisfire])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (context) {
      for (const arrow of arrows) {
        arrow.render(context, width, height)
      }
    }
  })

  return <canvas id="arrow" ref={canvasRef} width={width} height={height} />
}

Canvas.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
  angle: 45,
  fire: false,
}

export default Canvas
