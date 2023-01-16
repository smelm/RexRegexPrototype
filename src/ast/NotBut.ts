import { RandomSeed } from "random-seed"
import { NodeJSEngine, RegexEngine } from "../engines"
import { Expression, ExpressionType } from "./Expression"

export class NotBut extends Expression {
    constructor(public readonly child: Expression, public readonly exception: Expression) {
        super(ExpressionType.CUSTOM)
    }

    positiveTestCases(ast: Expression, rng: RandomSeed): string[] {
        const exceptPattern = new RegExp(this.exception.toRegex(new NodeJSEngine()))
        return this.child.positiveTestCases(ast, rng).filter(sample => !exceptPattern.test(sample))
    }

    negativeTestCases(ast: Expression, rng: RandomSeed): string[] {
        return [
            ...this.child.negativeTestCases(ast, rng),
            ...this.exception.positiveTestCases(ast, rng),
        ]
    }

    toRegex(engine: RegexEngine): string {
        // TODO use negative look-ahead instead of look-behind?
        return `(?:(?!${this.exception.toRegex(engine)})${this.child.toRegex(engine)})`
    }

    toString(): string {
        return `notBut(${this.child.toString()}, ${this.exception.toString()})`
    }

    toDSL(indentLevel: number): string {
        return [
            this.indent("not", indentLevel),
            this.child.toDSL(indentLevel + 1),
            this.indent("but", indentLevel),
            this.exception.toDSL(indentLevel + 1),
            this.indent("end", indentLevel),
        ].join("\n")
    }
}
