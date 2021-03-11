import React, { useState } from "react"
//import logo from "./logo.svg";
import DrawArrow from "./DrawArrow"
import { BackgroundCanvas } from "./DrawBackground"
import "./App.css"

const App = () => {
  const [angle, setAngle] = useState<number>(45)
  const [velocity, setVelocity] = useState<number>(20)
  const [fire, setFire] = useState<boolean>(false)
  const changeAngle = (value: string) => {
    const value_int: number = parseInt(value)
    setAngle(value_int ? value_int : angle)
  }
  const changeVelocity = (value: string) => {
    const value_int: number = parseInt(value)
    setVelocity(value_int ? value_int : angle)
  }
  return (
    <div className="App">
      <div style={{ position: "absolute", zIndex: 99 }}>
        <form>
          <label>
            Angle:
            <input
              type="number"
              name="angle"
              value={angle}
              onChange={(e) => changeAngle(e.target.value)}
            />
          </label>
          <label>
            Velocity:
            <input
              type="number"
              name="velocity"
              value={velocity}
              onChange={(e) => changeVelocity(e.target.value)}
            />
          </label>
        </form>
        <button
          onClick={() => {
            console.log({ fire: fire, angle: angle })
            setFire(!fire)
          }}
        >
          Fire
        </button>
      </div>
      <BackgroundCanvas />
      <DrawArrow angle={angle} velocity={velocity} fire={fire} />
    </div>
  )
}

export default App
