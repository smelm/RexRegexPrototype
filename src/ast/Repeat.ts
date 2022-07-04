import { spaces as _ } from "../commonParsers"
import { SequenceParser, AlternativeParser } from "../parsing"
import { expressionOrBlock } from "../Expression"
import { MANY, OF, TO } from "../keywords"
import { NumberParser } from "../parsing"
import { RandomGenerator } from "../RandomGenerator"

import { Expression, ExpressionType } from "./Expression"

const number = new NumberParser()

// TODO support "0 to many"
// TODO support "maybe many of", or not?
export class Repeat extends Expression {
    public static parser = new AlternativeParser([
        new SequenceParser([MANY, _, OF, expressionOrBlock]).builder(
            ([expr]: Expression[]) => new Repeat(expr, 1)
        ),
        new SequenceParser([number, _, OF, expressionOrBlock]).builder(
            ([number, expr]: any[]) => new Repeat(expr, number, number)
        ),
        new SequenceParser([
            number,
            _,
            TO,
            _,
            new AlternativeParser([number, MANY]),
            _,
            OF,
            expressionOrBlock,
        ]).builder(
            ([from, to, expr]: any[]) => new Repeat(expr, from, to === "many" ? undefined : to)
        ),
    ])

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
}
