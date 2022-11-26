import { RandomSeed } from "random-seed"
import { Expression, ExpressionType } from "./Expression"
import { WrappingExpression } from "./WrappingExpression"

enum PositionInInput {
    BEGINNING,
    END,
    WITHIN,
    WHOLE,
}

export class ScriptSettings {
    // default to whole string match
    constructor(public readonly positionInInput: PositionInInput = PositionInInput.WHOLE) {}
}

export class DSLScript extends WrappingExpression {
    private settings: ScriptSettings

    constructor(public child: Expression, settings?: ScriptSettings) {
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

        // this seems counter-intuitive
        // since the DSL defaults to whole string match
        let [prefix, suffix] = (() => {
            switch (this.settings.positionInInput) {
                case PositionInInput.BEGINNING:
                    return ["^", ""]
                case PositionInInput.END:
                    return ["", "$"]
                case PositionInInput.WITHIN:
                    return ["", ""]
                case PositionInInput.WHOLE:
                default:
                    return ["^", "$"]
            }
        })()

        return `${prefix}(:?${pattern})$${suffix}`
    }
}
