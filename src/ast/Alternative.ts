import { RandomSeed } from "random-seed"
import { Expression, ExpressionType } from "./Expression"
import { WrappingExpression } from "./WrappingExpression"

export class Alternative extends WrappingExpression {
    constructor(private alternatives: Expression[]) {
        super(ExpressionType.ALTERNATIVE)
    }

    toRegex(): string {
        return this.alternatives.map((e: Expression) => e.toRegex()).join("|")
    }

    contentToString(): string {
        return this.alternatives.map(a => a.toString()).join(", ")
    }

    private matchedByAlternative(input: string): boolean {
        for (let alt of this.alternatives) {
            if (new RegExp(alt.toRegex()).test(input)) {
                return true
            }
        }

        return false
    }

    generateValid(rng: RandomSeed): string[] {
        return this.alternatives.flatMap((e: Expression) => e.generateValid(rng))
    }

    generateInvalid(rng: RandomSeed): string[] {
        return this.alternatives.flatMap((e: Expression) => {
            const invalidSamples = e.generateInvalid(rng)

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

                const newInvalid = e.generateInvalid(rng)
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
}
