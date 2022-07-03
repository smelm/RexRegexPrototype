import { ANY } from "../keywords"
import { RandomGenerator } from "../RandomGenerator"

import { Expression, ExpressionType } from "./Expression"
import { randomCharacter } from "./Character"

export class Any extends Expression {
    public static parser = ANY.builder(() => new Any())

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
}
