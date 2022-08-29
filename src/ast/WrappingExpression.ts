import { Expression } from "./Expression"

export abstract class WrappingExpression extends Expression {
    abstract contentToString(): string

    toString(): string {
        return `${this.type.toString()}(${this.contentToString()})`
    }
}
