import { Expression, ExpressionType } from "../ast"
import { RegexEngine } from "../engines"
import { RandomGenerator } from "../RandomGenerator"

class Dummy extends Expression {
    constructor() {
        super(ExpressionType.DUMMY)
    }

    positiveTestCases(_tree: Expression, _rng: RandomGenerator): string[] {
        throw new Error("Method not implemented.")
    }

    negativeTestCases(_tree: Expression, _rng: RandomGenerator): string[] {
        throw new Error("Method not implemented.")
    }

    toRegex(_engine: RegexEngine): string {
        throw new Error("Method not implemented.")
    }

    toString(): string {
        throw new Error("Method not implemented.")
    }

    toDSL(_level: number): string {
        throw new Error("Method not implemented.")
    }
}

export const DUMMY = new Dummy()
