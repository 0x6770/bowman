import react from "react"
import useCanvas from "./useCanvas"

interface CanvasProps {
    draw: (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, index: number) => void
    preDraw: (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, index: number) => void
    postDraw: (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, index: number) => void
    height: number
    width: number
    style?: react.CSSProperties
}

// deal with high pixel density, reduce blurriness
const resizeCanvasToDisplaySize = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D,) => {
    const { width, height } = canvas.getBoundingClientRect()
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        return true
    }
    return false
}

// adjust the size of the canvas
const resizeCanvas = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
    const { width, height } = canvas.getBoundingClientRect()
    if (canvas.width !== width || canvas.height !== height) {
        const { devicePixelRatio = 1 } = window
        canvas.width = width * devicePixelRatio
        canvas.height = height * devicePixelRatio
        context.scale(devicePixelRatio, devicePixelRatio)
        return true
    }
    return false
}

// a function get called before calling draw()
const postDraw_preset = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, index: number) => {
    index++
    context.restore()
}

// a function get called after calling draw()
const preDraw_preset = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, index: number) => {
    context.save()
    resizeCanvasToDisplaySize(canvas, context)
    const { width, height } = context.canvas
    // context.clearRect(0, 0, width, height)
}

export const Canvas = ({ draw, preDraw, postDraw, style }: CanvasProps) => {
    const canvasRef = useCanvas({ draw: draw, preDraw: preDraw, postDraw: postDraw })
    return <canvas style={style} ref={canvasRef} />
}

Canvas.defaultProps = {
    preDraw: preDraw_preset,
    postDraw: postDraw_preset,
    height: window.innerHeight,
    width: window.innerWidth
}
