import { RandomGenerator } from "../RandomGenerator"

import { Expression, ExpressionType } from "./Expression"
import { randomCharacter } from "./Character"

export class Any extends Expression {
    constructor() {
        super(ExpressionType.ANY, "any")
    }

    toString(): string {
        return this.type.toString()
    }

    generateValid(rng: RandomGenerator): string[] {
        return [randomCharacter(rng)]
    }

    generateInvalid(_rng: RandomGenerator): string[] {
        //TODO: handle dotall mode here
        return []
    }

    toRegex(): string {
        return "."
    }
}
