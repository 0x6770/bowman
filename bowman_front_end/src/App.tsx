import react, { useState, useEffect } from "react"
import { BackgroundCanvas } from "./DrawBackground"
import { PlayerCanvas } from "./DrawPlayer"
import { DrawArrow } from "./DrawArrow"
import { DrawTrajectory } from "./DrawTrajectory"

import { ArrowStatus, PlayerStatus } from "./types"

const socket = new WebSocket('ws://localhost:8080/ws')

const Home = () => {
  const [players, setPlayers] = useState<PlayerStatus[]>([])
  const [arrows, setArrows] = useState<ArrowStatus[]>([])
  const [firedArrows, setFiredArrows] = useState<ArrowStatus[]>([])

  const PlayerCanvases = players.map((player) => <PlayerCanvas key={`${player.color}`} player={player} />)
  const ArrowCanvases = arrows.map(arrow => <DrawArrow key={`${arrow.color}`} arrowData={arrow} />)
  const TrajectoryCanvases = firedArrows.map(firedArrow => <DrawTrajectory key={`${firedArrow!.color}_${firedArrow!.time}`} trajectoryData={firedArrow!} />)

  useEffect(() => {
    socket.onopen = () => {
      console.log('WebSocket Client Connected')
      let msg = {
        method: "players"
      }
      socket.send(JSON.stringify(msg))
    }

    socket.onmessage = (event) => {
      // console.log(event.data)
      if (typeof (event.data) === "string") {
        const message = JSON.parse(event.data)
        // console.log(`message: ${message}`)
        switch (message.method) {
          case "update": {
            console.log("updating players")
            if (message.msg && message.msg === "success") {
              setPlayers(message.players)
              setArrows(message.arrows)
            }
            break
          }
          case "fire": {
            console.log("fire")
            if (message.msg && message.msg === "success") {
              setFiredArrows(prevFiredArrows =>
                [...prevFiredArrows, {
                  x0: message.x0,
                  c: message.c,
                  color: message.color,
                  angle: message.angle,
                  velocity: message.velocity,
                  time: message.time,
                  fire: true
                }])
            }
            break
          }
          default: {
            break
          }
        }
      }
    }
  }, [])

  return (
    <div>
      <BackgroundCanvas />
      { PlayerCanvases}
      { ArrowCanvases}
      { TrajectoryCanvases}
    </div >
  )
}

export default Home