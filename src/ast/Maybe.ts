import { RandomGenerator } from "../RandomGenerator"
import { Expression, ExpressionType } from "./Expression"
import { WrappingExpression } from "./WrappingExpression"

export class Maybe extends WrappingExpression {
    constructor(private value: Expression) {
        super(ExpressionType.MAYBE)
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

    contentToString(): string {
        return this.value.toString()
    }
}
