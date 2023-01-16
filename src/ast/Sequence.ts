import { RandomGenerator } from "../RandomGenerator"
import shuffle from "shuffle-array"

import { Expression, ExpressionType } from "./Expression"
import { WrappingExpression } from "./WrappingExpression"
import { EngineType } from "../engines"

export class Sequence extends WrappingExpression {
    public readonly children: Expression[]

    constructor(children: Expression[]) {
        super(ExpressionType.SEQUENCE)
        this.children = this.unnestSequences(children)
    }

    // turns seq(a, seq(b, c)) into seq(a, b, c)
    unnestSequences(children: Expression[]): Expression[] {
        return children.flatMap((child): Expression[] => {
            if (child.type === ExpressionType.SEQUENCE) {
                return (child as Sequence).children
            } else {
                return [child]
            }
        })
    }

    contentToString(): string {
        return this.children.map((v: Expression) => v.toString()).join(", ")
    }

    private combinations(examplesPerElement: string[][]): string[] {
        if (examplesPerElement.length === 0) {
            return []
        }

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
            let examples = valid
                ? child.positiveTestCases(tree, rng)
                : child.negativeTestCases(tree, rng)
            shuffle(examples, { rng: rng.random })
            return examples
        })
    }

    positiveTestCases(tree: Expression, rng: RandomGenerator): string[] {
        return this.combinations(this.examplesFromChildren(tree, true, rng))
    }

    negativeTestCases(tree: Expression, rng: RandomGenerator): string[] {
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

    toRegex(engine: EngineType): string {
        return `(?:${this.children.map((c: Expression) => c.toRegex(engine)).join("")})`
    }

    toDSL(indentLevel: number): string {
        return this.children.map(child => child.toDSL(indentLevel)).join("\n")
    }
}
