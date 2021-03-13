interface PlayerStatus {
    name: string
    hp: number
    x: number
    color: string
}

interface ArrowStatus {
    x: number
    angle: number
    c: number
    velocity: number
    color: string
    fire: boolean
    time: Date
}

export type { PlayerStatus, ArrowStatus }