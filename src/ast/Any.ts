import { RandomGenerator } from "../RandomGenerator"

import { Expression, ExpressionType } from "./Expression"
import { randomCharacter } from "./Character"

export class Any extends Expression {
    constructor() {
        super(ExpressionType.ANY)
    }

    toString(): string {
        return this.type.toString()
    }

    generateValid(_tree: Expression, rng: RandomGenerator): string[] {
        return [randomCharacter(rng)]
    }

    generateInvalid(_tree: Expression, _rng: RandomGenerator): string[] {
        //TODO: handle dotall mode here
        return []
    }

    toRegex(): string {
        return "."
    }

    toDSL(indentLevel: number): string {
        return this.indent("any", indentLevel)
    }
}
