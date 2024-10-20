import { request } from 'undici'
import Logger from '../../discord-bot/src/Logger'
import WebSocket from 'ws';
import { validateJson } from './util';
import { inspect } from 'node:util';
import { messageUser } from '../index';

export type SimpleReportedInventory = ({name: string, count: number} | null)[]

export const ws = new WebSocket(`ws://${process.env.REPORTING_HOSTNAME}/game`, {
    perMessageDeflate: false
});

ws.on('error', (error: Error) => {
    Logger.error('Websocket received error: ' + error.toString())
})

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

ws.on('message', (data) => {
    Logger.info('Received websocket message')
    const parsed = validateJson(data.toString())
    if (!parsed || !parsed?.type) return Logger.warn(`[Websocket] Received invalid JSON data (${data.toString()})`)

    switch (parsed.type) {
        case 'send-auth-code':
            if (!parsed.ign || !parsed.code) return; // should probably tell the server it errored
            // Logger.info(inspect(parsed))
            messageUser(parsed.ign, `Your verification code is: ${parsed.code}`)
            break;
        default: break;
    }
})