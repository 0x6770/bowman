import react, { useState, useEffect, Dispatch, SetStateAction, useMemo } from "react"
// import { io } from "socket.io-client"
import { BackgroundCanvas } from "./DrawBackground"
import { PlayerCanvas } from "./DrawPlayer"

interface Player {
    name: string
    hp: number
    x: number
}

const socket = new WebSocket('ws://127.0.0.1:8080/ws')

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

const JoinGame = () => {
    const [name, setName] = useState("")
    const send = () => {
        let msg = {
            method: "join",
            params: {
                name: name
            }
        }
        console.log(msg)
        if (msg.params.name) {
            console.log("sending join game request")
            socket.send(JSON.stringify(msg))
        }
    }
    return (
        <div>
            <InputText label="name" value={name} onChange={setName} />
            <button onClick={() => { send() }}>Join</button>
        </div>
    )
}

const Fire = ({ id }: { id: string }) => {
    const [angle, setAngle] = useState<number>(45)
    const [velocity, setVelocity] = useState<number>(20)
    const send = () => {
        if (id != "") {
            const msg = {
                method: "fire",
                params: {
                    id: id,
                    angle: angle,
                    velocity: velocity
                }
            }
            console.log(msg)
            console.log("sending fire request")
            socket.send(JSON.stringify(msg))
        } else {
            console.error("id not found, need join first")
        }
    }
    return (
        <div>
            <InputNumber label="angle" value={angle} onChange={setAngle} />
            <InputNumber label="velocity" value={velocity} onChange={setVelocity} />
            <button onClick={() => { send() }}>Fire</button>
        </div>
    )
}

const Home = () => {
    const [id, setId] = useState<string>("")
    const [players, setPlayers] = useState<Player[]>([])
    const [angle, setAngle] = useState<number>(45)
    const [velocity, setVelocity] = useState<number>(20)
    const [fire, setFire] = useState<number>(0)

    useEffect(() => {
        socket.onopen = () => {
            console.log('WebSocket Client Connected')
            let msg = {
                method: "players"
            }
            socket.send(JSON.stringify(msg))
        }

        socket.onmessage = (event) => {
            console.log(event.data)
            if (typeof (event.data) === "string") {
                const message = JSON.parse(event.data)
                console.log(`message: ${message}`)
                switch (message.method) {
                    case "join": {
                        if (message.msg && message.msg === "success") {
                            console.log(`id: ${message.id}`)
                            console.log(`players: ${message.players}`)
                            setId(message.id)
                            setPlayers(message.players)
                        }
                        break
                    }
                    case "update": {
                        console.log("updating players")
                        if (message.msg && message.msg === "success") {
                            console.log(`players: ${message.players}`)
                            setPlayers(message.players)
                        }
                        break
                    }
                    case "fire": {
                        console.log("fire")
                        break
                    }
                    default: {
                        break
                    }
                }
            }
        }
    }, [])

    useEffect(() => { })

    return (
        <>
            <BackgroundCanvas />
            <JoinGame />
            <Fire id={id} />
            {players.map((player) =>
                <PlayerCanvas key={player.name + player.x} player={player} angle={angle} velocity={velocity} fire={fire} />
            )}
        </>
    )
}

export default Home