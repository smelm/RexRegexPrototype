import { RandomGenerator } from "../RandomGenerator"
import { CharacterClass } from "./CharacterClass"
import { Expression } from "./Expression"

export class InvertedCharacterClass extends CharacterClass {
    constructor(
        members: string[],
        ranges: [string, string][],
        inverted: boolean = false,
        numSamplesToGenerate: number = 5
    ) {
        super(members, ranges, true, numSamplesToGenerate)
    }

    generateValid(tree: Expression, rng: RandomGenerator): string[] {
        return super.generateInvalid(tree, rng)
    }

    generateInvalid(tree: Expression, rng: RandomGenerator): string[] {
        return super.generateValid(tree, rng)
    }
}
