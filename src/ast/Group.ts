import { RandomGenerator } from "../RandomGenerator"
import { Expression } from "./Expression"
import { ExpressionType } from "./Expression"
import { WrappingExpression } from "./WrappingExpression"

export class Group extends WrappingExpression {
    public context: Record<"valid" | "invalid", string[]> = { valid: [], invalid: [] }

    constructor(public readonly name: string, private child: Expression) {
        super(ExpressionType.GROUP)
    }

    toRegex(): string {
        return `(?<${this.name}>${this.child.toRegex()})`
    }

    contentToString(): string {
        return `${this.name}, ${this.child.toString()}`
    }

    generateValid(tree: Expression, rng: RandomGenerator): string[] {
        let valid = this.child.generateValid(tree, rng)
        this.context["valid"] = valid
        return valid
    }

    generateInvalid(tree: Expression, rng: RandomGenerator): string[] {
        let invalid = this.child.generateInvalid(tree, rng)
        this.context["invalid"] = invalid
        return invalid
    }

    toDSL(indentLevel: number): string {
        return [`begin ${this.name}`, this.child.toDSL(indentLevel + 1), `end`]
            .map(s => this.indent(s, indentLevel))
            .join("\n")
    }
}
