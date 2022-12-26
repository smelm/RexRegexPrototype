import { RandomGenerator } from "../RandomGenerator"

import { Expression, ExpressionType } from "./Expression"
import { WrappingExpression } from "./WrappingExpression"

export class Character extends WrappingExpression {
    constructor(private value: string) {
        super(ExpressionType.CHARACTER)
    }

    contentToString(): string {
        return this.value
    }

    generateValid(_tree: Expression, _rng: RandomGenerator): string[] {
        return [this.value]
    }

    generateInvalid(_tree: Expression, rng: RandomGenerator): string[] {
        //TODO: this is not good
        //TODO: make this work with unicode
        //TODO: this could cause problems with greedy repetition before
        let char

        do {
            char = randomCharacter(rng)
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
