export const sleep = (ms: number) => {
    return new Promise((r) => {
        setTimeout(r, ms)
    })
}

export const o = <T = any>(v: T) => v

export const validateJson = (raw: string) => {
    try {
        return JSON.parse(raw)
    } catch {
        return null
    }
}
