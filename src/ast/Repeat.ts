import { RandomGenerator } from "../RandomGenerator"
import { Expression, ExpressionType } from "./Expression"

// TODO support "0 to many"
// TODO support "maybe many of", or not?
export class Repeat extends Expression {
    constructor(value: Expression, public lower: number, public upper?: number) {
        super(ExpressionType.REPEAT, value)
    }

    toString(): string {
        return `${this.type}(${this.lower}, ${this.upper}, ${this.value.toString()})`
    }

    /**
     * @returns the upper bound or a random number representing an upper bound of many
     */
    private generateUpper(rng: RandomGenerator): number {
        //TODO remove magic number
        return this.upper || rng.intBetween(this.lower, this.lower + 5)
    }

    generateValid(rng: RandomGenerator): string[] {
        const childStrings: string[] = this.value.generateValid(rng)

        if (this.lower === this.upper) {
            return childStrings.map(s => s.repeat(this.lower))
        } else {
            return childStrings
                .map(s => [s.repeat(this.lower), s.repeat(this.generateUpper(rng))])
                .flat()
        }
    }

    generateInvalid(rng: RandomGenerator): string[] {
        const validChildStr: string[] = this.value.generateValid(rng)
        const invalidChildStr: string[] = this.value.generateInvalid(rng)

        let result: string[] = []

        if (this.lower !== 0) {
            const validStringRepeatedTooFew = validChildStr.map(s => s.repeat(this.lower - 1))
            const invalidStringRepeatedCorrectlyLower = invalidChildStr.map(s =>
                s.repeat(this.lower)
            )

            result.push(...invalidStringRepeatedCorrectlyLower)
            result.push(...validStringRepeatedTooFew)
        }

        if (this.upper != null) {
            const validStringRepeatedTooMany = validChildStr.map(s => s.repeat(this.upper! + 1))
            result.push(...validStringRepeatedTooMany)
        }

        const invalidStringRepeatedCorrectlyUpper = invalidChildStr.map(s => s.repeat(this.upper!))
        result.push(...invalidStringRepeatedCorrectlyUpper)

        return result
    }
    //
    //TODO make sure that each branch is tested
    private compileRepeatOperator() {
        if (this.lower == null) {
            throw new Error(
                "to avoid ambiguity between 0 or 1 repetitions, the lower bound of the repeat operator may not be undefined"
            )
        }

        const noUpperBound = this.upper == null

        if (noUpperBound) {
            switch (this.lower) {
                case 0:
                    return `*`
                case 1:
                    return "+"
                default:
                    return `{${this.lower},}`
            }
        } else {
            if (this.lower === this.upper) {
                return `{${this.lower}}`
            } else {
                return `{${this.lower},${this.upper}}`
            }
        }
    }

    toRegex(): string {
        return `${this.value.toRegex()}${this.compileRepeatOperator()}`
    }
}
