import { EngineType } from "../engines"
import { RandomGenerator } from "../RandomGenerator"
import { Expression, ExpressionType } from "./Expression"
import { WrappingExpression } from "./WrappingExpression"

export enum PositionInInput {
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
    public readonly settings: ScriptSettings

    constructor(public child: Expression, settings?: ScriptSettings) {
        super(ExpressionType.SCRIPT)
        this.settings = settings || new ScriptSettings()
    }

    contentToString(): string {
        return this.child.toString()
    }

    positiveTestCases(tree: Expression, rng: RandomGenerator): string[] {
        return this.child.positiveTestCases(tree, rng)
    }

    negativeTestCases(tree: Expression, rng: RandomGenerator): string[] {
        return this.child.negativeTestCases(tree, rng)
    }

    toRegex(engine: EngineType): string {
        const pattern = this.child.toRegex(engine)

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

        return `${prefix}${pattern}${suffix}`
    }

    toDSL(_indentLevel: number = 0): string {
        return this.child.toDSL(0)
    }
}
