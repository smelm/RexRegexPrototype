import { RandomSeed } from "random-seed";
import { Expression, ExpressionType } from "./Expression";
import { WrappingExpression } from "./WrappingExpression";

export class ScriptSettings {
    constructor(public readonly startOfInput: boolean = false, public readonly endOfInput: boolean = false){}
}

export class DSLScript extends WrappingExpression {
    
    constructor(public child: Expression, private settings?: ScriptSettings) {
        super(ExpressionType.SCRIPT)

        if (!settings) {
            this.settings = new ScriptSettings()
        }
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