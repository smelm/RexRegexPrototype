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
}

export abstract class Expression implements InputGenerator {
    constructor(public type: ExpressionType, public value: any) {}

    abstract generateValid(rng: RandomGenerator): string[]
    abstract generateInvalid(rng: RandomGenerator): string[]
    abstract toRegex(): string

    toString(): string {
        return `${this.type}(${this.value.toString()})`
    }
}
