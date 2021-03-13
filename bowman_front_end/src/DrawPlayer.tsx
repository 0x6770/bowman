import React, { useState } from "react"
import Arrow from "./Arrow"
import { Canvas } from "./createCanvas"
import { PlayerStatus } from "./types"

const SCALE: number = window.innerWidth / 100

interface PlayerCanvasProps {
  player: PlayerStatus
}

export const PlayerCanvas = ({ player }: PlayerCanvasProps) => {
  const cWidth = window.innerWidth
  const cHeight = window.innerHeight
  const ground_level: number = 100
  const width = 2
  const height = 2
  const color = player.color
  const x = (player.x - width / 2) * SCALE
  const y = cHeight - ground_level - height * SCALE

  const draw = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, index: number) => {
    context.clearRect(0, 0, cWidth, cHeight)
    context.save()
    context.fillStyle = player.hp == 0 ? "grey" : color
    context.fillRect(x, y, width * SCALE, height * SCALE)
    context.font = "bold 16px Arial"
    context.fillText(player.name, x, y - 10)
    context.font = "16px Arial"
    context.fillText(`hp: ${player.hp.toString()}`, x, y - 40)
    context.font = "16px Arial"
    context.fillStyle = "#efefef"
    context.fillText(`${player.x.toString()}`, x, (y + 40))
    context.restore()
  }
  return (
    <Canvas draw={draw} style={{ zIndex: -9 }} />
  )
}