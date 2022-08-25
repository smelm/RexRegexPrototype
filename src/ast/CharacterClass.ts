import { RandomSeed } from "random-seed"
import { cummulativeSum, randomInt, shuffle } from "../utils"
import { Expression, ExpressionType } from "./Expression"

export class CharacterClass extends Expression {
    private ranges: [number, number][]
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

        this.verifyRanges()

        if (this.numSamplesToGenerate > this.size()) {
            this.numSamplesToGenerate = this.size()
        }

        this.endIndices = cummulativeSum(this.ranges.map(this.rangeLength))
    }

    private generateRanges(members: string[], ranges: [string, string][]): [number, number][] {
        ranges = [...ranges, ...(members.map(m => [m, m]) as [string, string][])]

        let bounds = ranges.map(([lower, upper]) => {
            if (lower.length !== 1 || upper.length !== 1) {
                throw new Error(`expected single character got ${lower} - ${upper}`)
            }

            const lowerCode = lower.charCodeAt(0)
            const upperCode = upper.charCodeAt(0)

            if (lowerCode > upperCode) {
                throw new Error(
                    `lower bound of range is bigger than upper bound ${lower} - ${upper}`
                )
            }

            return [lowerCode, upperCode]
        }) as [number, number][]

        bounds.sort(([a], [b]) => a - b)

        // prune overlaps
        const lower = 0
        const upper = 1
        for (let i = 0; i < bounds.length; i++) {
            if (bounds[i + 1][lower] < bounds[i][upper]) {
                bounds[i + 1][lower] = bounds[i][upper] + 1
            }
        }

        return bounds
    }

    private verifyRanges() {}

    private rangeLength([lower, upper]: [number, number]): number {
        return upper - lower + 1
    }

    private size(): number {
        return this.ranges.map(this.rangeLength).reduce((a, b) => a + b, 0)
    }

    generateValid(rng: RandomSeed): string[] {
        const size = this.size()
        const samples = []
        const wasGenerated: boolean[][] = this.ranges.map(r =>
            new Array(this.rangeLength(r)).fill(false)
        )

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
            samples.push(this.charFromRange(this.ranges[rangeIndex], charIndex))
        }

        return samples
    }

    private charFromRange([lower, upper]: [number, number], charIndex: number): string {
        if (lower + charIndex > upper) {
            throw new Error(
                `Character index ${charIndex} out of range in char range ${String.fromCharCode(
                    lower
                )} - ${String.fromCharCode(upper)}`
            )
        }

        return String.fromCharCode(lower + charIndex)
    }

    generateInvalid(rng: RandomSeed): string[] {
        //TODO: use actual unicode maximum
        const maxValidCharacter = 20_000
        for (let i = 0; i < this.numSamplesToGenerate; i++) {
            const charRange = maxValidCharacter - this.size() - i
        }
        return []
    }

    toRegex(): string {
        return `[${this.ranges
            .map(([lower, upper]) =>
                lower === upper
                    ? String.fromCharCode(lower)
                    : String.fromCharCode(lower) + "-" + String.fromCharCode(upper)
            )
            .join("")}]`
    }
}
