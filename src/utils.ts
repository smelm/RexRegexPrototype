export function sampleFromList<T>(l: T[], k = 1): T[] {
    if (k === 1) {
        const element = l[Math.floor(Math.random() * l.length)]
        return [element]
    }

    return shuffle(l).slice(0, k)
}

export function cummulativeSum(l: number[]): number[] {
    let result = [...l]

    for (let i = 1; i < l.length; i++) {
        result[i] += result[i - 1]
    }

    return result
}

export function randomInt(upper: number): number {
    return randomIntBetween(0, upper)
}

export function randomIntBetween(lower: number, upper: number): number {
    return Math.floor(Math.random() * upper) + lower
}
