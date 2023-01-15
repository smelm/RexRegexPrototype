import { Expression, ExpressionType } from "../ast"
import { RandomGenerator } from "../RandomGenerator"

class Dummy extends Expression {
    constructor() {
        super(ExpressionType.DUMMY)
    }

    generateValid(_tree: Expression, _rng: RandomGenerator): string[] {
        throw new Error("Method not implemented.")
    }

    generateInvalid(_tree: Expression, _rng: RandomGenerator): string[] {
        throw new Error("Method not implemented.")
    }

    toRegex(): string {
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
