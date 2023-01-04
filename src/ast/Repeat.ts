import { RandomGenerator } from "../RandomGenerator"
import { CharacterClass } from "./CharacterClass"
import { Expression, ExpressionType } from "./Expression"
import { Group } from "./Group"
import { WrappingExpression } from "./WrappingExpression"

// TODO support "0 to many"
// TODO support "maybe many of", or not?
export class Repeat extends WrappingExpression {
    constructor(
        public readonly child: Expression,
        public readonly lower: number,
        public readonly upper?: number,
        public readonly lazy: boolean = false
    ) {
        super(ExpressionType.REPEAT)
    }

    contentToString(): string {
        return `${this.child.toString()}, ${this.lower}-${this.upper}`
    }

    /**
     * @returns the upper bound or a random number representing an upper bound of many
     */
    private generateUpper(rng: RandomGenerator): number {
        //TODO remove magic number
        return this.upper || rng.intBetween(this.lower, this.lower + 5)
    }

    generateValid(tree: Expression, rng: RandomGenerator): string[] {
        const childStrings: string[] = this.child.generateValid(tree, rng)

        if (this.lower === this.upper) {
            return childStrings.map(s => s.repeat(this.lower))
        } else {
            return childStrings
                .map(s => [s.repeat(this.lower), s.repeat(this.generateUpper(rng))])
                .flat()
        }
    }

    generateInvalid(tree: Expression, rng: RandomGenerator): string[] {
        const validChildStr: string[] = this.child.generateValid(tree, rng)
        const invalidChildStr: string[] = this.child.generateInvalid(tree, rng)

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

    private noUpperBound() {
        return this.upper == null
    }

    //TODO make sure that each branch is tested
    private compileGreedyRepeatOperator(): string {
        if (this.lower == null) {
            throw new Error(
                "to avoid ambiguity between 0 or 1 repetitions, the lower bound of the repeat operator may not be undefined"
            )
        }

        if (this.noUpperBound()) {
            switch (this.lower) {
                case 0:
                    return `*`
                case 1:
                    return "+"
                default:
                    return `{${this.lower},}`
            }
        } else if (this.lower == 0 && this.upper == 1) {
            return "?"
        } else {
            if (this.lower === this.upper) {
                return `{${this.lower}}`
            } else {
                return `{${this.lower},${this.upper}}`
            }
        }
    }

    compileRepeatOperator(): string {
        const operator = this.compileGreedyRepeatOperator()

        if (this.lazy) {
            return `${operator}?`
        } else {
            return operator
        }
    }

    toRegex(): string {
        return `${this.child.toRegex()}${this.compileRepeatOperator()}`
    }

    toDSL(indentLevel: number): string {
        let operator

        if (this.lower === 0 && this.upper === 1) {
            operator = `maybe`
        } else if (this.noUpperBound()) {
            operator = `${this.lower} to many of`
        } else {
            operator = `${this.lower} to ${this.upper} of`
        }

        const formatAsLine =
            this.child.type === ExpressionType.CHARACTER ||
            this.child.type === ExpressionType.ANY ||
            (this.child.type === ExpressionType.CHARACTER_CLASS &&
                (this.child as CharacterClass).isPredefined)

        if (formatAsLine) {
            return this.indent(`${operator} ${this.child.toDSL(0)}`, indentLevel)
        } else {
            return [
                this.indent(operator, indentLevel),
                this.child.toDSL(indentLevel + 1),
                this.indent("end", indentLevel),
            ].join("\n")
        }
    }
}
