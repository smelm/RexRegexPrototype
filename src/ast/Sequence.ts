import { RandomGenerator } from "../RandomGenerator"
import shuffle from "shuffle-array"

import { Expression, ExpressionType } from "./Expression"
import { WrappingExpression } from "./WrappingExpression"

export class Sequence extends WrappingExpression {
    constructor(private children: Expression[]) {
        super(ExpressionType.SEQUENCE)
    }

    contentToString(): string {
        return this.children.map((v: Expression) => v.toString()).join(", ")
    }

    private combinations(examplesPerElement: string[][]): string[] {
        const MAX_LENGTH = Math.max(...examplesPerElement.map(arr => arr.length))

        return Array(MAX_LENGTH)
            .fill(undefined)
            .map((_, i) =>
                examplesPerElement.map(examples => examples[i % examples.length]).join("")
            )
    }

    private examplesFromChildren(
        tree: Expression,
        valid: boolean,
        rng: RandomGenerator
    ): string[][] {
        return this.children.map((child: Expression) => {
            let examples = valid ? child.generateValid(tree, rng) : child.generateInvalid(tree, rng)
            shuffle(examples, { rng: rng.random })
            return examples
        })
    }

    generateValid(tree: Expression, rng: RandomGenerator): string[] {
        return this.combinations(this.examplesFromChildren(tree, true, rng))
    }

    generateInvalid(tree: Expression, rng: RandomGenerator): string[] {
        const validExamples = this.examplesFromChildren(tree, true, rng)
        const invalidExamples = this.examplesFromChildren(tree, false, rng)

        let result: string[] = []

        invalidExamples.forEach((example, i) => {
            if (example.length === 0) {
                return
            }

            let combinations = this.combinations([
                ...validExamples.slice(0, i),
                example,
                ...validExamples.slice(i + 1),
            ])
            result = [...result, ...combinations]
        })

        return result
    }

    toRegex(): string {
        return `(?:${this.children.map((c: Expression) => c.toRegex()).join("")})`
    }
}
