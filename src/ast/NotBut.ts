import { RandomSeed } from "random-seed"
import { Expression, ExpressionType } from "./Expression"

export class NotBut extends Expression {
    constructor(public readonly child: Expression, public readonly exception: Expression) {
        super(ExpressionType.CUSTOM)
    }

    generateValid(ast: Expression, rng: RandomSeed): string[] {
        const exceptPattern = new RegExp(this.exception.toRegex())
        return this.child.generateValid(ast, rng).filter(sample => !exceptPattern.test(sample))
    }

    generateInvalid(ast: Expression, rng: RandomSeed): string[] {
        return [...this.child.generateInvalid(ast, rng), ...this.exception.generateValid(ast, rng)]
    }

    toRegex(): string {
        // use negative look-ahead
        return `(?:(?!${this.exception.toRegex()})${this.child.toRegex()})`
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
            this.indent("", indentLevel + 1),
            this.indent("end", indentLevel),
        ].join("\n")
    }
}
