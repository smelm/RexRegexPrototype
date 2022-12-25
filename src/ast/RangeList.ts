import { CharRange } from "./CharRange"
import { cummulativeSum, randomInt } from "../utils"

export class RangeList {
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

    sample(n: number, rng: RandomSeed): string[] {
        const size = this.size()
        const samples = []
        const wasGenerated: boolean[][] = this.ranges.map(r => new Array(r.length()).fill(false))

        for (let i = 0; i < n; i++) {
            const ind = randomInt(size, rng)
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
