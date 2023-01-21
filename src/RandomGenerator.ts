import * as gen from "random-seed"

export type RandomGenerator = gen.RandomSeed

/**
 * @returns random string of numbers and letters
 */
export function generateRandomSeed(): string {
    const letters = 26
    const digits = 10
    const base = letters + digits
    return Math.random().toString(base).slice(2)
}

export function newRandomGenerator(seed: string = ""): RandomGenerator {
    if (seed === "") {
        seed = generateRandomSeed()
    }

    return gen.create(seed)
}
