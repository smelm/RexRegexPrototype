//TODO look at property driven testing frame works

import { RandomGenerator } from "./RandomGenerator"

//TODO: change signature to validExamples() and invalidExamples()
export interface InputGenerator {
    generateValid: (rng: RandomGenerator) => string[]
    generateInvalid: (rng: RandomGenerator) => string[]
}
