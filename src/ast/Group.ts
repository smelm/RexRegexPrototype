import { EngineType, RegexEngine } from "../engines"
import { RandomGenerator } from "../RandomGenerator"
import { Expression } from "./Expression"
import { ExpressionType } from "./Expression"
import { WrappingExpression } from "./WrappingExpression"

export class Group extends WrappingExpression {
    public context: Record<"valid" | "invalid", string[]> = { valid: [], invalid: [] }

    constructor(public readonly name: string, public readonly child: Expression) {
        super(ExpressionType.GROUP)
    }

    toRegex(engine: RegexEngine): string {
        switch (engine.type) {
            case EngineType.PYTHON:
                return `(?P<${this.name}>${this.child.toRegex(engine)})`
            case EngineType.NODE_JS:
                return `(?<${this.name}>${this.child.toRegex(engine)})`
        }
    }

    contentToString(): string {
        return `${this.name}, ${this.child.toString()}`
    }

    positiveTestCases(tree: Expression, rng: RandomGenerator): string[] {
        let valid = this.child.positiveTestCases(tree, rng)
        this.context["valid"] = valid
        return valid
    }

    negativeTestCases(tree: Expression, rng: RandomGenerator): string[] {
        let invalid = this.child.negativeTestCases(tree, rng)
        this.context["invalid"] = invalid
        return invalid
    }

    toDSL(indentLevel: number): string {
        return [`begin ${this.name}`, this.child.toDSL(indentLevel + 1), `end`]
            .map(s => this.indent(s, indentLevel))
            .join("\n")
    }
}
