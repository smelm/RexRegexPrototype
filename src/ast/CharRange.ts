export class CharRange {
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

    toDSL(): string {
        if (this.lower === this.upper) {
            return String.fromCharCode(this.lower)
        } else {
            return `${String.fromCharCode(this.lower)} to ${String.fromCharCode(this.upper)}`
        }
    }
}
