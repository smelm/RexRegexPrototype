import { RandomSeed } from "random-seed";
import { Expression, ExpressionType } from "./Expression";
import { WrappingExpression } from "./WrappingExpression";


export class DSLScript extends WrappingExpression {
    constructor(public child: Expression) {
        super(ExpressionType.SCRIPT)
    }

    contentToString(): string {
        return this.child.toString()
    }

    generateValid(rng: RandomSeed): string[] {
        return this.child.generateValid(rng)
    }

    generateInvalid(rng: RandomSeed): string[] {
        return this.child.generateInvalid(rng)
    }

    toRegex(): string {
        const pattern = this.child.toRegex()
        return `^(:?${pattern})$`
    }
   
}