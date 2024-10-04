export type SimpleReportedInventory = ({name: string, count: number} | null)[]


export const announceMilestonePlacing = (n: number, coords: [number, number, number][], inventory: SimpleReportedInventory) => {
    const key = process.env.GAME_BOT_KEY
    console.log({n, coords, inventory})


}