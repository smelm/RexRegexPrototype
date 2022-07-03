import { SequenceParser, spaces as _ } from "../commonParsers"
import { expressionOrBlock } from "../Expression"
import { MAYBE } from "../keywords"
import { RandomGenerator } from "../RandomGenerator"

import { Expression, ExpressionType } from "./Expression"

export class Maybe extends Expression {
    public static parser = new SequenceParser([MAYBE, expressionOrBlock]).builder(
        ([expr]: Expression[]) => new Maybe(expr)
    )

    constructor(value: Expression) {
        super(ExpressionType.MAYBE, value)
    }

    generateValid(rng: RandomGenerator): string[] {
        return [...this.value.generateValid(rng), ""]
    }

    generateInvalid(rng: RandomGenerator): string[] {
        return this.value.generateInvalid(rng)
    }
}
