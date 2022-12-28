import { Expression, ExpressionType } from "./Expression"
import { WrappingExpression } from "./WrappingExpression"
import { RangeList } from "./RangeList"
import { RandomGenerator } from "../RandomGenerator"

export class CharacterClass extends WrappingExpression {
    private ranges: RangeList

    constructor(
        members: string[],
        ranges: [string, string][],
        private inverted: boolean = false,
        public readonly isPredefined: boolean = false,
        private readonly numSamplesToGenerate: number = 5
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

    generateValid(_tree: Expression, rng: RandomGenerator): string[] {
        return this.ranges.sample(this.numSamplesToGenerate, rng)
    }

    generateInvalid(_tree: Expression, rng: RandomGenerator): string[] {
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

    toDSL(indentLevel: number): string {
        const indent = " ".repeat(4 * indentLevel)
        return `${indent}any{this.inverted? " except" : ""} of\n${this.ranges
            .map(range => range.toDSL())
            .join("\n" + indent + "    ")}`
    }
}
