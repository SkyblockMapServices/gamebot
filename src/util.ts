export const sleep = (ms: number) => {
    return new Promise((r) => {
        setTimeout(r, ms)
    })
}

export const o = <T = any>(v: T) => v