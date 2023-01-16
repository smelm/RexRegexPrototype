import { EngineType } from "../engines"
import { RandomGenerator } from "../RandomGenerator"

import { Expression, ExpressionType } from "./Expression"
import { WrappingExpression } from "./WrappingExpression"

export class Character extends WrappingExpression {
    constructor(public readonly value: string) {
        super(ExpressionType.CHARACTER)
    }

    contentToString(): string {
        return this.value
    }

    positiveTestCases(_tree: Expression, _rng: RandomGenerator): string[] {
        return [this.value]
    }

    negativeTestCases(_tree: Expression, rng: RandomGenerator): string[] {
        let char

        do {
            char = randomCharacter(rng)
        } while (char === this.value)

        return [char]
    }

    toRegex(_engine: EngineType): string {
        if (this.mustBeEscaped()) {
            return `\\${this.value}`
        }
        return this.value
    }

    mustBeEscaped(): boolean {
        return /[\\.\[\](){}+?*]/.test(this.value)
    }

    toDSL(indentLevel: number): string {
        return this.indent(`"${this.value}"`, indentLevel)
    }
}

//TODO: this is terrible
export function randomCharacter(generator: RandomGenerator) {
    return String.fromCharCode(generator.intBetween(40, 122))
}
