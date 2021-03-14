import react, { useState, useEffect, Dispatch, SetStateAction } from "react"
import { BackgroundCanvas } from "./DrawBackground"
import { PlayerCanvas } from "./DrawPlayer"
import { DrawArrow } from "./DrawArrow"
import { DrawTrajectory } from "./DrawTrajectory"

import { ArrowStatus, PlayerStatus } from "./types"

const socket = new WebSocket('ws://localhost:8080/ws')

const InputText = ({ label, value, onChange }: { label: string, value: string, onChange: Dispatch<SetStateAction<string>> }) => {
  return (
    <div>
      <label>{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

const InputNumber = ({ label, value, onChange }: { label: string, value: number, onChange: Dispatch<SetStateAction<number>> }) => {
  const code = (event: React.ChangeEvent<HTMLInputElement>): number => {
    const result = parseInt(event.target.value ? event.target.value : "0")
    return result >= 0 && result <= 999999 ? result : value
  }
  return (
    <div>
      <label>{label}</label>
      <input type="string" pattern="[0-9]*" value={value} onChange={(e) => onChange(code(e))} />
    </div>
  )
}

const JoinGame = ({ onChange }: { onChange: Dispatch<SetStateAction<boolean>> }) => {
  const [name, setName] = useState("")
  const send = () => {
    let msg = {
      method: "join",
      params: {
        name: name
      }
    }
    if (msg.params.name) {
      console.log("sending join game request")
      socket.send(JSON.stringify(msg))
      onChange(true)
    }
  }
  return (
    <div style={{ border: "solid 2px black", margin: "2rem" }}>
      <InputText label="name" value={name} onChange={setName} />
      <button onClick={() => { send() }}>Join</button>
    </div>
  )
}

const Fire = ({ id }: { id: string }) => {
  const [angle, setAngle] = useState<number>(45)
  const [velocity, setVelocity] = useState<number>(20)
  const fire = () => {
    if (id != "") {
      const msg = {
        method: "fire",
        params: {
          id: id,
          angle: angle,
          velocity: velocity
        }
      }
      console.log("sending fire request")
      socket.send(JSON.stringify(msg))
    } else {
      console.error("id not found, need join first")
    }
  }
  const adjustAngle = () => {
    if (id != "") {
      const msg = {
        method: "angle",
        params: {
          id: id,
          angle: angle,
        }
      }
      console.log("sending adjust angle request")
      socket.send(JSON.stringify(msg))
    } else {
      console.error("id not found, need join first")
    }
  }

  return (
    <div style={{ border: "solid 2px black", margin: "2rem" }}>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <InputNumber label="angle" value={angle} onChange={setAngle} />
        <button onClick={() => { adjustAngle() }}>Adjust</button>
      </div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <InputNumber label="velocity" value={velocity} onChange={setVelocity} />
        <button onClick={() => { fire() }}>Fire</button>
      </div>
    </div>
  )
}

const Home = () => {
  const [id, setId] = useState<string>("")
  const [players, setPlayers] = useState<PlayerStatus[]>([])
  const [arrows, setArrows] = useState<ArrowStatus[]>([])
  const [firedArrows, setFiredArrows] = useState<ArrowStatus[]>([])
  const [joined, setJoined] = useState<boolean>(false)

  const PlayerCanvases = players.map((player) => <PlayerCanvas key={`${player.color}`} player={player} />)
  const ArrowCanvases = arrows.map(arrow => <DrawArrow key={`${arrow.color}`} arrowData={arrow} />)
  // const FiredArrowCanvases = firedArrows.map(arrow => <DrawArrowNew key={`${arrow.color}_${arrow.time}`} arrow={arrow} />)
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
          case "join": {
            if (message.msg && message.msg === "success") {
              // console.log(`id: ${message.id}`)
              // console.log(`players: ${message.players}`)
              setId(message.id)
              setPlayers(message.players)
            }
            break
          }
          case "update": {
            console.log("updating players")
            if (message.msg && message.msg === "success") {
              // console.log(`players: ${JSON.stringify(message.players)}`)
              // console.log(`arrows: ${JSON.stringify(message.arrows)}`)
              setPlayers(message.players)
              setArrows(message.arrows)
            }
            break
          }
          case "fire": {
            console.log("fire")
            if (message.msg && message.msg === "success") {
              // console.log(`fire: ${JSON.stringify(message)}`)
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
      {/* {!joined ? <JoinGame onChange={setJoined} /> : <Fire id={id} />} */}
      { PlayerCanvases}
      { ArrowCanvases}
      { TrajectoryCanvases}
    </div >
  )
}

export default Home