import { RandomGenerator } from "../RandomGenerator"

export enum ExpressionType {
    ANY = "any",
    REPEAT = "repeat",
    MAYBE = "maybe",
    SEQUENCE = "sequence",
    CHARACTER = "character",
    GROUP = "group",
    ALTERNATIVE = "alternative",
    CHARACTER_CLASS = "characterClass",
    DUMMY = "dummy",
    SCRIPT = "script",
    BACKREFERENCE = "backreference",
    CUSTOM = "custom",
}

export abstract class Expression {
    constructor(public type: ExpressionType) {}

    abstract generateValid(ast: Expression, rng: RandomGenerator): string[]
    abstract generateInvalid(ast: Expression, rng: RandomGenerator): string[]
    abstract toRegex(): string
    abstract toString(): string
    abstract toDSL(identLevel: number): string

    indent(text: string, indentLevel: number): string {
        const tab = " ".repeat(4 * indentLevel)
        return tab + text
    }
}
