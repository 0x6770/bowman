import { useRef, useEffect, useState } from 'react'

interface useCanvasProps {
    draw: (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, index: number) => void
    preDraw: (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, index: number) => void
    postDraw: (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, index: number) => void
}

const useCanvas = ({ draw, preDraw, postDraw }: useCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const requestRef = useRef<number>()
    // const [frameCount, setFrameCount] = useState<number>(0)

    useEffect(() => {
        let frameCount = 0
        const render = () => {
            const canvas = canvasRef.current!
            const context: CanvasRenderingContext2D = canvas!.getContext('2d')!
            frameCount++
            preDraw(canvas, context, frameCount)
            draw(canvas, context, frameCount)
            postDraw(canvas, context, frameCount)
            requestRef.current = requestAnimationFrame(render)
        }
        render()
        return () => {
            cancelAnimationFrame(requestRef.current!)
        }
    }, [draw])

    return canvasRef
}
export default useCanvas