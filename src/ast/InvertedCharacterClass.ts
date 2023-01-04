import { RandomGenerator } from "../RandomGenerator"
import { CharacterClass } from "./CharacterClass"
import { CharRange } from "./CharRange"
import { Expression } from "./Expression"

export class InvertedCharacterClass extends CharacterClass {
    constructor(ranges: CharRange[], numSamplesToGenerate: number = 5) {
        super(ranges, true, false, numSamplesToGenerate)
    }

    generateValid(tree: Expression, rng: RandomGenerator): string[] {
        return super.generateInvalid(tree, rng)
    }

    generateInvalid(tree: Expression, rng: RandomGenerator): string[] {
        return super.generateValid(tree, rng)
    }
}
