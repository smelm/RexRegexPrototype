import { RandomGenerator } from "../RandomGenerator"
import { RandomSeed } from "random-seed"

import { Expression, ExpressionType } from "./Expression"

export class Character extends Expression {
    constructor(value: string) {
        super(ExpressionType.CHARACTER, value)
    }

    toString(): string {
        return `${this.type}(${this.value})`
    }

    generateValid(rng: RandomSeed): string[] {
        return [this.value]
    }

    generateInvalid(generator: RandomGenerator): string[] {
        //TODO: this is not good
        //TODO: make this work with unicode
        //TODO: this could cause problems with greedy repetition before
        let char

        do {
            char = randomCharacter(generator)
        } while (char === this.value)

        return [char]
    }

    //TODO handle escaping
    toRegex(): string {
        return this.value
    }
}

//TODO: this is terrible
export function randomCharacter(generator: RandomGenerator) {
    return String.fromCharCode(generator.intBetween(40, 122))
}
