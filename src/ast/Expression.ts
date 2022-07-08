import { InputGenerator } from "../Generator"
import { RandomGenerator } from "../RandomGenerator"

export enum ExpressionType {
    ANY = "any",
    REPEAT = "repeat",
    MAYBE = "maybe",
    SEQUENCE = "sequence",
    CHARACTER = "character",
}

export abstract class Expression implements InputGenerator {
    constructor(public type: ExpressionType, public value: any) {}

    generateValid(rng: RandomGenerator): string[] {
        throw new Error("not implemented")
    }

    generateInvalid(rng: RandomGenerator): string[] {
        throw new Error("not implemented")
    }

    toString(): string {
        return `${this.type}(${this.value.toString()})`
    }

    abstract toRegex(): string
}
