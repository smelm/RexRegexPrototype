import { RandomSeed } from "random-seed"
import { Expression, ExpressionType } from "./Expression"

export class Backreference extends Expression {
    constructor(private groupName: string) {
        super(ExpressionType.BACKREFERENCE)
    }

    generateValid(rng: RandomSeed): string[] {
        throw new Error("Method not implemented.")
    }

    generateInvalid(rng: RandomSeed): string[] {
        throw new Error("Method not implemented.")
    }

    toRegex(): string {
        return `\\k<${this.groupName}>`
    }

    toString(): string {
        throw new Error("Method not implemented.")
    }
}
