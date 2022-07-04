//TODO look at property driven testing frame works

import { RandomGenerator } from "./RandomGenerator"

export interface InputGenerator {
    generateValid: (rng: RandomGenerator) => string[]
    generateInvalid: (rng: RandomGenerator) => string[]
}
