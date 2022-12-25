import { RandomSeed } from "random-seed"
import { ExpressionType } from "./Expression"
import { WrappingExpression } from "./WrappingExpression"
import { RangeList } from "./RangeList"

export class CharacterClass extends WrappingExpression {
    private ranges: RangeList

    constructor(
        members: string[],
        ranges: [string, string][],
        inverted: boolean = false,
        private numSamplesToGenerate: number = 5
    ) {
        super(ExpressionType.CHARACTER_CLASS)

        this.ranges = this.generateRanges(members, ranges)

        if (this.numSamplesToGenerate > this.ranges.size()) {
            this.numSamplesToGenerate = this.ranges.size()
        }
    }

    private generateRanges(members: string[], ranges: [string, string][]): RangeList {
        ranges = [...ranges, ...(members.map(m => [m, m]) as [string, string][])]

        return RangeList.fromStringList(ranges)
    }

    contentToString(): string {
        return this.ranges.map<string>(r => r.toString()).join(", ")
    }

    generateValid(rng: RandomSeed): string[] {
        return this.ranges.sample(this.numSamplesToGenerate, rng)
    }

    generateInvalid(rng: RandomSeed): string[] {
        return this.ranges.invert().sample(this.numSamplesToGenerate, rng)
    }

    toRegex(): string {
        return `[${this.ranges
            .map(range =>
                range.lower === range.upper
                    ? String.fromCharCode(range.lower)
                    : String.fromCharCode(range.lower) + "-" + String.fromCharCode(range.upper)
            )
            .join("")}]`
    }
}
