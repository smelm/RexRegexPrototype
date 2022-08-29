import { RandomSeed } from "random-seed"
import { Expression } from "./Expression"
import { ExpressionType } from "./Expression"
import { WrappingExpression } from "./WrappingExpression"

export class Group extends WrappingExpression {
    constructor(private name: string, private content: Expression) {
        super(ExpressionType.GROUP)
    }

    toRegex(): string {
        return `(?<${this.name}>${this.content.toRegex()})`
    }

    contentToString(): string {
        return `${this.name}, ${this.content.toString()}`
    }

    generateValid(rng: RandomSeed): string[] {
        return this.content.generateValid(rng)
    }

    generateInvalid(rng: RandomSeed): string[] {
        return this.content.generateInvalid(rng)
    }
}
