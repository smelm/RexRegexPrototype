import { RandomGenerator } from "../RandomGenerator"
import { Expression, ExpressionType } from "./Expression"
import { WrappingExpression } from "./WrappingExpression"

export class Alternative extends WrappingExpression {
    constructor(private children: Expression[]) {
        super(ExpressionType.ALTERNATIVE)
    }

    toRegex(): string {
        return this.children.map((e: Expression) => e.toRegex()).join("|")
    }

    contentToString(): string {
        return this.children.map(a => a.toString()).join(", ")
    }

    private matchedByAlternative(input: string): boolean {
        for (let alt of this.children) {
            if (new RegExp(alt.toRegex()).test(input)) {
                return true
            }
        }

        return false
    }

    generateValid(tree: Expression, rng: RandomGenerator): string[] {
        return this.children.flatMap((e: Expression) => e.generateValid(tree, rng))
    }

    generateInvalid(tree: Expression, rng: RandomGenerator): string[] {
        return this.children.flatMap((e: Expression) => {
            const invalidSamples = e.generateInvalid(tree, rng)

            let wronglyValidIndices: number[] = []
            for (let num = 0; num < 3; num++) {
                wronglyValidIndices = invalidSamples
                    .map((s, i): [boolean, number] => [this.matchedByAlternative(s), i])
                    //@ts-ignore
                    .filter(([matched, _]): [boolean, number] => matched)
                    .map(([_, i]) => i)

                if (wronglyValidIndices.length === 0) {
                    return invalidSamples
                }

                const newInvalid = e.generateInvalid(tree, rng)
                for (let idx of wronglyValidIndices) {
                    invalidSamples[idx] = newInvalid[idx]
                }
            }

            // must remove indices in reverse
            for (let idx of wronglyValidIndices.slice().reverse()) {
                invalidSamples.splice(idx, 1)
            }

            return invalidSamples
        })
    }

    toDSL(indentLevel: number): string {
        return [
            this.indent("either", indentLevel),
            ...this.children.map(c => c.toDSL(indentLevel + 1)),
            this.indent("end", indentLevel),
        ].join("\n")
    }
}
