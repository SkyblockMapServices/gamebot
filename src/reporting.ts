import { request }from 'undici'
import Logger from '../../discord-bot/src/Logger'
export type SimpleReportedInventory = ({name: string, count: number} | null)[]

export const URLs = {
    placement: process.env.REPORTING_HOSTNAME + '/gamebot/report_placing_milestone'
}

export const announceMilestonePlacing = (n: number, coords: [number, number, number][], inventory: SimpleReportedInventory) => {
    const key = process.env.GAME_BOT_KEY

    request(URLs.placement, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            milestone: n,
            coordsPlaced: coords,
            inventory: inventory,
            key: key,
        }),
    }).then(() => {
        Logger.success('Reported placing milestone')
    }).catch(e => {
        Logger.warn('Failed to report placing milestone. ' + e.toString())
    })

}