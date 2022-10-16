import { InputGenerator } from "../Generator"
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
    DUMMY = "dummy", // used for parsing
    SCRIPT = "script"
}

export abstract class Expression implements InputGenerator {
    constructor(public type: ExpressionType) {}

    abstract generateValid(rng: RandomGenerator): string[]
    abstract generateInvalid(rng: RandomGenerator): string[]
    abstract toRegex(): string
    abstract toString(): string
}
