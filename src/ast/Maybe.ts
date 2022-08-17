import { RandomGenerator } from "../RandomGenerator"
import { Expression, ExpressionType } from "./Expression"

export class Maybe extends Expression {
    constructor(value: Expression) {
        super(ExpressionType.MAYBE, value)
    }

    generateValid(rng: RandomGenerator): string[] {
        return [...this.value.generateValid(rng), ""]
    }

    generateInvalid(rng: RandomGenerator): string[] {
        return this.value.generateInvalid(rng)
    }

    toRegex(): string {
        return `${this.value.toRegex()}?`
    }
}
