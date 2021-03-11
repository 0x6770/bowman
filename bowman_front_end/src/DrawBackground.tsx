import React, { useRef, useEffect } from "react"

interface BackgroundCanvasProps {
  width: number
  height: number
}

export const BackgroundCanvas = ({ width, height }: BackgroundCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ground_level: number = 100

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (context) {
      context.fillStyle = "#333333"
      context.fillRect(0, height - ground_level, width, ground_level)
    }
  }, [width, height])

  return (
    <canvas id="background" style={{ zIndex: -99 }} ref={canvasRef} width={width} height={height} />
  )
}

BackgroundCanvas.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
}
