import { RegexEngine } from "../engines"
import { RandomGenerator } from "../RandomGenerator"
import { CharacterClass } from "./CharacterClass"
import { CharRange } from "./CharRange"
import { Expression } from "./Expression"
import { RawClassMember } from "./types"

export class InvertedCharacterClass extends CharacterClass {
    constructor(ranges: CharRange[], numSamplesToGenerate: number = 5) {
        super(ranges, true, false, numSamplesToGenerate)
    }

    toRegex(engine: RegexEngine): string {
        return `[^${this.contentToRegex(engine)}]`
    }

    positiveTestCases(tree: Expression, rng: RandomGenerator): string[] {
        return super.negativeTestCases(tree, rng)
    }

    negativeTestCases(tree: Expression, rng: RandomGenerator): string[] {
        return super.positiveTestCases(tree, rng)
    }

    static fromMemberList(members: RawClassMember[]): CharacterClass {
        return new InvertedCharacterClass(CharacterClass.fromMemberList(members).ranges.ranges)
    }
}
