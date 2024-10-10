import { request } from 'undici'
import Logger from '../../discord-bot/src/Logger'
import WebSocket from 'ws';
export type SimpleReportedInventory = ({name: string, count: number} | null)[]

export const ws = new WebSocket(`ws://${process.env.REPORTING_HOSTNAME}/game`, {
    perMessageDeflate: false
});
export const key = process.env.GAME_BOT_KEY

export const announceMilestonePlacing = (n: number, coords: [number, number, number][], inventory: SimpleReportedInventory) => {
    ws.send(JSON.stringify({
        type: 'placing-milestone',
        milestone: n,
        coordsPlaced: coords,
        inventory: inventory,
        key: key,
    }))
}

export const announceInventory = (inventory: SimpleReportedInventory) => {
    ws.send(JSON.stringify({
        type: 'inventory',
        inventory: inventory,
        key: key,
    }))
}

export const announceBotSpawning = () => {
    ws.send(JSON.stringify({
        type: 'bot-spawned',
        key: key,
    }))
}