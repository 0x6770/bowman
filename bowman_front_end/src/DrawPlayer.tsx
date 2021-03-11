import React, { useRef, useEffect, useState } from "react"
import Arrow from "./Arrow"

interface Player {
  name: string
  hp: number
  x: number
}

interface PlayerCanvasProps {
  cWidth: number
  cHeight: number
  player: Player
  angle: number
  velocity: number
  fire: number
}

export const PlayerCanvas = ({ cWidth, cHeight, player, angle, velocity, fire }: PlayerCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ground_level: number = 100
  const width = 20
  const height = 20
  const color = "#4287f5"
  const x = player.x / 100 * cWidth - width
  const y = cHeight - ground_level - height
  const [arrows, setArrows] = useState<Arrow[]>([new Arrow(player.x - (width / 2) / (cWidth / 100), ground_level, "red")])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    console.log(`draw player, ${player.name}, ${player.hp}, ${player.x}`)
    let id: number
    if (context) {
      context.clearRect(0, 0, cWidth, cHeight)
      context.save()
      context.fillStyle = player.hp == 0 ? "grey" : color
      context.font = "16px Arial"
      context.fillRect(x, y, width, height)
      context.fillText(player.name, x, y - 10)
      context.fillText(player.hp.toString(), x, y - 40)
      context.restore()
      arrows[arrows.length - 1].print()
      arrows[arrows.length - 1].render(context, width, height)
    }
  })

  return (
    <canvas id="background" style={{ zIndex: -99 }} ref={canvasRef} width={cWidth} height={cHeight} />
  )
}

PlayerCanvas.defaultProps = {
  cWidth: window.innerWidth,
  cHeight: window.innerHeight,
}

