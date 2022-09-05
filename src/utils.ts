import { RandomSeed } from "random-seed"

export function cummulativeSum(l: number[]): number[] {
    let result = [...l]

    for (let i = 1; i < l.length; i++) {
        result[i] += result[i - 1]
    }

    return result
}

export function randomInt(upper: number, rng: RandomSeed): number {
    return randomIntBetween(0, upper, rng)
}

export function randomIntBetween(lower: number, upper: number, rng: RandomSeed): number {
    return Math.floor(rng.random() * upper) + lower
}

export function zip(...arrays: any): any {
    return Array.apply(null, Array(arrays[0].length)).map(function (_, i) {
        return arrays.map(function (array: any) {
            return array[i]
        })
    })
}
