import { RandomSeed } from "random-seed"
import { Expression } from "./Expression"
import { ExpressionType } from "./Expression"

export class Group extends Expression {
    constructor(private name: string, private content: Expression) {
        super(ExpressionType.GROUP, content)
    }

    toRegex(): string {
        return `(?<${this.name}>${this.content.toRegex()})`
    }

    generateValid(rng: RandomSeed): string[] {
        return this.value.generateValid(rng)
    }

    generateInvalid(rng: RandomSeed): string[] {
        return this.value.generateInvalid(rng)
    }
}
