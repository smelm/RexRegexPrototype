import { RandomSeed } from "random-seed"
import { CharacterClass } from "./CharacterClass"

export class InvertedCharacterClass extends CharacterClass {
    constructor(
        members: string[],
        ranges: [string, string][],
        inverted: boolean = false,
        numSamplesToGenerate: number = 5
    ) {
        super(members, ranges, true, numSamplesToGenerate)
    }

    generateValid(rng: RandomSeed): string[] {
        return super.generateInvalid(rng)
    }

    generateInvalid(rng: RandomSeed): string[] {
        return super.generateValid(rng)
    }
}
