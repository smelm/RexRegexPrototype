import { RandomGenerator } from "../RandomGenerator"

import { Expression, ExpressionType } from "./Expression"
import { randomCharacter } from "./Character"
import { RegexEngine } from "../engines"

export class Any extends Expression {
    constructor() {
        super(ExpressionType.ANY)
    }

    toString(): string {
        return this.type.toString()
    }

    positiveTestCases(_tree: Expression, rng: RandomGenerator): string[] {
        return [randomCharacter(rng)]
    }

    negativeTestCases(_tree: Expression, _rng: RandomGenerator): string[] {
        //TODO: handle dotall mode here
        return []
    }

    toRegex(_engine: RegexEngine): string {
        return "."
    }

    toDSL(indentLevel: number): string {
        return this.indent("any", indentLevel)
    }
}
