import { RandomSeed } from "random-seed"
import { cummulativeSum, randomInt } from "../utils"
import { Expression, ExpressionType } from "./Expression"

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
}

export class CharacterClass extends Expression {
    private ranges: CharRange[]
    /*
     * Contains what number of character the range ends at
     * example: [ a-b d e-f x ]
     *          [  2  3  5  6 ]
     */
    private endIndices: number[]

    constructor(
        members: string[],
        ranges: [string, string][],
        private numSamplesToGenerate: number = 5
    ) {
        super(ExpressionType.CHARACTER_CLASS, null)

        this.ranges = this.generateRanges(members, ranges)

        if (this.numSamplesToGenerate > this.size()) {
            this.numSamplesToGenerate = this.size()
        }

        this.endIndices = cummulativeSum(this.ranges.map(r => r.length()))
    }

    private generateRanges(members: string[], ranges: [string, string][]): CharRange[] {
        ranges = [...ranges, ...(members.map(m => [m, m]) as [string, string][])]

        let charRanges = ranges.map(([lower, upper]) => CharRange.fromStrings(lower, upper))

        charRanges.sort((a, b) => a.lower - b.lower)

        // prune overlaps
        for (let i = 0; i < charRanges.length - 1; i++) {
            if (charRanges[i].upper > charRanges[i + 1].lower) {
                charRanges[i + 1].lower = charRanges[i].upper + 1
            }
        }

        return charRanges
    }

    private size(): number {
        return this.ranges.map(r => r.length()).reduce((a, b) => a + b, 0)
    }

    generateValid(rng: RandomSeed): string[] {
        const size = this.size()
        const samples = []
        const wasGenerated: boolean[][] = this.ranges.map(r => new Array(r.length()).fill(false))

        for (let i = 0; i < this.numSamplesToGenerate; i++) {
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

    generateInvalid(rng: RandomSeed): string[] {
        return []
    }

    static invertRanges(ranges: CharRange[]): CharRange[] {
        //TODO: use actual unicode maximum
        const maxValidCharacter = 20_000
        const minValidCharacter = 0

        const invertedRanges: CharRange[] = []

        let currentLower = minValidCharacter
        for (let r of ranges) {
            const [lower, upper] = r.toList()
            if (currentLower < lower) {
                invertedRanges.push(new CharRange(currentLower, r.lower - 1))
            }
            currentLower = upper + 1
        }
        const [lastRange] = ranges.slice(-1)
        const maxOfCharClass = lastRange.upper
        invertedRanges.push(new CharRange(maxOfCharClass + 1, maxValidCharacter))

        return invertedRanges
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
