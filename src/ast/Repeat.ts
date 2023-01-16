import { RegexEngine } from "../engines"
import { RandomGenerator } from "../RandomGenerator"
import { sequence } from "./astBuilders"
import { CharacterClass } from "./CharacterClass"
import { Expression, ExpressionType } from "./Expression"
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

    private repeatChild(tree: Expression, rng: RandomGenerator, times: number): Expression {
        return sequence(
            ...new Array(times)
                .fill(undefined)
                .map(() => CharacterClass.fromMemberList(this.child.positiveTestCases(tree, rng)))
        )
    }

    private repeatChildValid(tree: Expression, rng: RandomGenerator, times: number): string[] {
        return this.repeatChild(tree, rng, times).positiveTestCases(tree, rng)
    }

    private repeatChildInvalid(tree: Expression, rng: RandomGenerator, times: number): string[] {
        return this.repeatChild(tree, rng, times).negativeTestCases(tree, rng)
    }

    positiveTestCases(tree: Expression, rng: RandomGenerator): string[] {
        if (this.lower === this.upper) {
            return this.repeatChildValid(tree, rng, this.lower)
        } else {
            return [
                ...this.repeatChildValid(tree, rng, this.lower),
                ...this.repeatChildValid(tree, rng, this.generateUpper(rng)),
            ]
        }
    }

    negativeTestCases(tree: Expression, rng: RandomGenerator): string[] {
        let result: string[] = []

        if (this.lower !== 0) {
            result.push(...this.repeatChildValid(tree, rng, this.lower - 1))
            result.push(...this.repeatChildInvalid(tree, rng, this.lower))
        }

        if (this.upper != null) {
            result.push(...this.repeatChildValid(tree, rng, this.upper! + 1))
        }

        result.push(...this.repeatChildInvalid(tree, rng, this.generateUpper(rng)))

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

    toRegex(engine: RegexEngine): string {
        return `${this.child.toRegex(engine)}${this.compileRepeatOperator()}`
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
