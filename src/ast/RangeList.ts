import { CharRange } from "./CharRange"
import { cummulativeSum, randomInt } from "../utils"
import { RandomGenerator } from "../RandomGenerator"

export class RangeList {
    /*
     * Contains what number of character the range ends at
     * example: [ a-b d e-f x ]
     *          [  2  3  5  6 ]
     */
    public readonly ranges: CharRange[]

    constructor(ranges: CharRange[]) {
        ranges = [...ranges].sort((a, b) => a.lower - b.lower)
        RangeList.pruneOverlaps(ranges)

        this.ranges = ranges
    }

    private generateEndIndices(): number[] {
        return cummulativeSum(this.ranges.map(r => r.length()))
    }

    static fromStringList(ranges: [string, string][]): RangeList {
        let charRanges = ranges.map(([lower, upper]) => CharRange.fromStrings(lower, upper))
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

    sample(n: number, rng: RandomGenerator): string[] {
        const endIndices = this.generateEndIndices()
        const size = this.size()
        const samples = []
        const wasGenerated: boolean[][] = this.ranges.map(r => new Array(r.length()).fill(false))

        for (let i = 0; i < n; i++) {
            const ind = randomInt(size, rng)
            const rangeIndex = endIndices.findIndex(end => ind < end)!

            // calculate total offset where previous range did end
            // for the first range offset is zero
            const offset = rangeIndex && endIndices[rangeIndex - 1]
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
        const maxValidCharacter = 200
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
        if (maxOfCharClass < maxValidCharacter) {
            invertedRanges.push(new CharRange(maxOfCharClass + 1, maxValidCharacter))            
        }

        return new RangeList(invertedRanges)
    }

    getRanges() {
        return this.ranges
    }

    remove(rangesToRemove: RangeList): RangeList {
        let result = [...this.ranges]

        for (let rangeToRemove of rangesToRemove.ranges) {
            result = result.flatMap(range => range.remove(rangeToRemove))
        }
        return new RangeList(result)
    }
}
