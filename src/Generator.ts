//TODO look at property driven testing frame works

import { RandomGenerator } from "./RandomGenerator"

export interface InputExample {
    str: string
    description: string
}

export interface InputGenerator {
    /**
     *  @param valid whether the generated string should be accepted/valid
     *  @param randomSeed the random seed used for sampling
     *  @returns str: the generated string and message: something like "repeated once too many"
     */
    generate: (valid: boolean, rng: RandomGenerator) => InputExample[]
}
