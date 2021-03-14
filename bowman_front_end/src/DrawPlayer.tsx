import React, { useState } from "react"
import Arrow from "./Arrow"
import { Canvas } from "./createCanvas"
import { PlayerStatus } from "./types"

const SCALE: number = window.innerWidth / 100
const RATIO: number = Math.ceil(window.devicePixelRatio)

interface PlayerCanvasProps {
  player: PlayerStatus
}

export const PlayerCanvas = ({ player }: PlayerCanvasProps) => {
  const { color, x0, hp, name } = player
  const cWidth = window.innerWidth
  const cHeight = window.innerHeight
  const ground_level: number = 100
  const width = 1
  const height = 1
  const x = Math.ceil((x0 - width * RATIO / 2) * SCALE)
  const y = cHeight - ground_level - height * SCALE * RATIO

  const draw = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, index: number) => {
    context.clearRect(0, 0, cWidth, cHeight)
    context.save()
    context.fillStyle = hp == 0 ? "grey" : color
    context.fillRect(x, y, width * SCALE * RATIO, height * SCALE * RATIO)
    context.font = "bold 16px Arial"
    context.fillText(name, x, y - 10 * RATIO)
    context.font = "16px Arial"
    context.fillText(`hp: ${hp.toString()}`, x, y - 25 * RATIO)
    context.font = "16px Arial"
    context.fillStyle = "#efefef"
    context.fillText(`${x0.toString()}`, x + width * RATIO / 2 * SCALE, (y + height * SCALE * RATIO + 40))
    context.restore()
  }
  return (
    <Canvas draw={draw} style={{ zIndex: -99 }} />
  )
}