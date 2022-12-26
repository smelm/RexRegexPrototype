import { RandomGenerator } from "../RandomGenerator"
import { Expression } from "./Expression"
import { ExpressionType } from "./Expression"
import { WrappingExpression } from "./WrappingExpression"

export class Group extends WrappingExpression {
    constructor(private name: string, private child: Expression) {
        super(ExpressionType.GROUP)
    }

    toRegex(): string {
        return `(?<${this.name}>${this.child.toRegex()})`
    }

    contentToString(): string {
        return `${this.name}, ${this.child.toString()}`
    }

    generateValid(tree: Expression, rng: RandomGenerator): string[] {
        return this.child.generateValid(tree, rng)
    }

    generateInvalid(tree: Expression, rng: RandomGenerator): string[] {
        return this.child.generateInvalid(tree, rng)
    }
}
