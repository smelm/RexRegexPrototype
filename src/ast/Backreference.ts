import { RandomGenerator } from "../RandomGenerator"
import { Expression, ExpressionType } from "./Expression"

export class Backreference extends Expression {
    constructor(private groupName: string) {
        super(ExpressionType.BACKREFERENCE)
    }

    generateValid(_tree: Expression, _rng: RandomGenerator): string[] {
        throw new Error("Method not implemented.")
    }

    generateInvalid(_tree: Expression, _rng: RandomGenerator): string[] {
        throw new Error("Method not implemented.")
    }

    toRegex(): string {
        return `\\k<${this.groupName}>`
    }

    toString(): string {
        return `${this.type}(${this.groupName})`
    }
}
