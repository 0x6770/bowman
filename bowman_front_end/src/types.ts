interface PlayerStatus {
    name: string
    hp: number
    x0: number
    color: string
}

interface ArrowStatus {
    x0: number
    angle: number
    c: number
    velocity: number
    color: string
    fire: boolean
    time: Date
}

export type { PlayerStatus, ArrowStatus }