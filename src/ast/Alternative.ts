import { EngineType, NodeJSEngine, RegexEngine } from "../engines"
import { RandomGenerator } from "../RandomGenerator"
import { Expression, ExpressionType } from "./Expression"
import { Group } from "./Group"
import { Repeat } from "./Repeat"
import { WrappingExpression } from "./WrappingExpression"

export class Alternative extends WrappingExpression {
    constructor(public readonly children: Expression[]) {
        super(ExpressionType.ALTERNATIVE)

        // when both children are literals the longer one is put first
        // this prevents cases like hell|hello that prefer the shorter match
        this.children.sort((a, b) => {
            return lengthOfExpression(b) - lengthOfExpression(a)
        })
    }

    toRegex(engine: RegexEngine): string {
        return `(?:${this.contentToRegex(engine)})`
    }

    contentToRegex(engine: RegexEngine): string {
        return this.children.map((e: Expression) => e.toRegex(engine)).join("|")
    }

    contentToString(): string {
        return this.children.map(a => a.toString()).join(", ")
    }

    private matchedByAlternative(input: string): boolean {
        for (let alt of this.children) {
            if (new RegExp(alt.toRegex(new NodeJSEngine())).test(input)) {
                return true
            }
        }

        return false
    }

    positiveTestCases(tree: Expression, rng: RandomGenerator): string[] {
        return this.children.flatMap((e: Expression) => e.positiveTestCases(tree, rng))
    }

    negativeTestCases(tree: Expression, rng: RandomGenerator): string[] {
        return this.children.flatMap((e: Expression) => {
            const invalidSamples = e.negativeTestCases(tree, rng)

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

                const newInvalid = e.negativeTestCases(tree, rng)
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

function lengthOfExpression(exp: Expression): number {
    switch (exp.type) {
        case ExpressionType.ANY:
            return 1
        case ExpressionType.REPEAT:
            const rep = exp as Repeat
            if (rep.upper) {
                return rep.upper * lengthOfExpression(rep.child)
            } else {
                return 1000
            }

        case ExpressionType.SEQUENCE:
            return (exp as Alternative).children.map(lengthOfExpression).reduce((a, b) => a + b, 0)
        case ExpressionType.CHARACTER:
            return 1
        case ExpressionType.GROUP:
            return lengthOfExpression((exp as Group).child)
        case ExpressionType.ALTERNATIVE:
            return (exp as Alternative).children
                .map(lengthOfExpression)
                .reduce((a, b) => (a > b ? a : b), 0)
        case ExpressionType.CHARACTER_CLASS:
            return 1
        case ExpressionType.BACKREFERENCE:
            // there is no way to no the length at compile time
            // because of that it should probably be further back in the alternative
            return -1
        default:
            return -1
    }
}
