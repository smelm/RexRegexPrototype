import { RandomSeed } from "random-seed"
import { cummulativeSum, randomInt } from "../utils"
import { Expression, ExpressionType } from "./Expression"
import { WrappingExpression } from "./WrappingExpression"

class CharRange {
    constructor(public lower: number, public upper: number) {
        if (lower > upper) {
            throw new Error(
                `invalid range (${lower} - ${upper}): upper bound smaller than lower bound`
            )
        }
    }

    static fromStrings(lower: string, upper: string): CharRange {
        if (lower.length !== 1 || upper.length !== 1) {
            throw new Error(`expected single character got ${lower} - ${upper}`)
        }

        const lowerCode = lower.charCodeAt(0)
        const upperCode = upper.charCodeAt(0)

        return new CharRange(lowerCode, upperCode)
    }

    char(index: number): string {
        if (this.lower + index > this.upper) {
            throw new Error(
                `Character index ${index} out of range in char range ${String.fromCharCode(
                    this.lower
                )} - ${String.fromCharCode(this.upper)}`
            )
        }

        return String.fromCharCode(this.lower + index)
    }

    toList(): [number, number] {
        return [this.lower, this.upper]
    }

    length() {
        return this.upper - this.lower + 1
    }

    toString(): string {
        if (this.lower === this.upper) {
            return String.fromCharCode(this.lower)
        } else {
            return `${String.fromCharCode(this.lower)}-${String.fromCharCode(this.upper)}`
        }
    }
}

class RangeList {
    /*
     * Contains what number of character the range ends at
     * example: [ a-b d e-f x ]
     *          [  2  3  5  6 ]
     */
    private endIndices: number[]

    constructor(private ranges: CharRange[]) {
        this.endIndices = this.generateEndIndices()
    }

    private generateEndIndices(): number[] {
        return cummulativeSum(this.ranges.map(r => r.length()))
    }

    static fromStringList(ranges: [string, string][]): RangeList {
        let charRanges = ranges.map(([lower, upper]) => CharRange.fromStrings(lower, upper))

        charRanges.sort((a, b) => a.lower - b.lower)
        this.pruneOverlaps(charRanges)

        return new RangeList(charRanges)
    }

    private static pruneOverlaps(ranges: CharRange[]) {
        for (let i = 0; i < ranges.length - 1; i++) {
            if (ranges[i].upper > ranges[i + 1].lower) {
                ranges[i + 1].lower = ranges[i].upper + 1
            }
        }
    }

    public size(): number {
        return this.ranges.map(r => r.length()).reduce((a: number, b: number) => a + b, 0)
    }

    map<T>(func: (r: CharRange) => T): T[] {
        return this.ranges.map(func)
    }

    sample(n: number): string[] {
        const size = this.size()
        const samples = []
        const wasGenerated: boolean[][] = this.ranges.map(r => new Array(r.length()).fill(false))

        for (let i = 0; i < n; i++) {
            const ind = randomInt(size)
            const rangeIndex = this.endIndices.findIndex(end => ind < end)!

            // calculate total offset where previous range did end
            // for the first range offset is zero
            const offset = rangeIndex && this.endIndices[rangeIndex - 1]
            const charIndex = ind - offset

            if (wasGenerated[rangeIndex][charIndex]) {
                // retry
                i--
                continue
            }

            wasGenerated[rangeIndex][charIndex] = true
            samples.push(this.ranges[rangeIndex].char(charIndex))
        }

        return samples
    }

    invert(): RangeList {
        //TODO: use actual unicode maximum
        const maxValidCharacter = 20_000
        const minValidCharacter = 0

        const invertedRanges: CharRange[] = []

        let currentLower = minValidCharacter
        for (let { lower, upper } of this.ranges) {
            if (currentLower < lower) {
                invertedRanges.push(new CharRange(currentLower, lower - 1))
            }
            currentLower = upper + 1
        }
        const [lastRange] = this.ranges.slice(-1)
        const maxOfCharClass = lastRange.upper
        invertedRanges.push(new CharRange(maxOfCharClass + 1, maxValidCharacter))

        return new RangeList(invertedRanges)
    }
}

export class CharacterClass extends WrappingExpression {
    private ranges: RangeList

    constructor(
        members: string[],
        ranges: [string, string][],
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
        return this.ranges.sample(this.numSamplesToGenerate)
    }

    generateInvalid(rng: RandomSeed): string[] {
        return this.ranges.invert().sample(this.numSamplesToGenerate)
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
