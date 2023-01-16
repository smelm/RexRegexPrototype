import { EngineType, RegexEngine } from "../engines"
import { RandomGenerator } from "../RandomGenerator"
import { randomIntBetween } from "../utils"
import { Expression, ExpressionType } from "./Expression"
import { Group } from "./Group"
import { findInAST } from "./utils"

export class Backreference extends Expression {
    constructor(private groupName: string) {
        super(ExpressionType.BACKREFERENCE)
    }

    isCorrespondingGroup(exp: Expression): boolean {
        return exp.type === ExpressionType.GROUP && (exp as Group).name === this.groupName
    }

    findCorrespondingGroup(tree: Expression): Group {
        let results = findInAST(tree, this.isCorrespondingGroup.bind(this))

        if (results.length > 1) {
            throw new Error(`multiple definitions of group ${this.groupName}`)
        } else if (results.length === 0) {
            throw new Error(`group ${this.groupName} is not defined`)
        } else {
            return results[0] as Group
        }
    }

    positiveTestCases(tree: Expression, _rng: RandomGenerator): string[] {
        const group = this.findCorrespondingGroup(tree)
        return group.context.valid
    }

    negativeTestCases(tree: Expression, rng: RandomGenerator): string[] {
        const group = this.findCorrespondingGroup(tree)
        const valid = group.context.valid

        if (valid.length < 2) {
            return group.negativeTestCases(tree, rng)
        } else {
            // this is the simplest possible derangement (permutation without trivial cycles)
            // this assumes that that there are no duplicate elements
            let shift = randomIntBetween(1, valid.length - 1, rng)
            // rotate the array by shift
            return [...valid.slice(shift), ...valid.slice(0, shift)]
        }
    }

    toRegex(engine: RegexEngine): string {
        switch (engine.type) {
            case EngineType.PYTHON:
                return `(?P=${this.groupName})`
            case EngineType.NODE_JS:
            default:
                return `\\k<${this.groupName}>`
        }
    }

    toString(): string {
        return `${this.type}(${this.groupName})`
    }

    toDSL(_indentLevel: number): string {
        return `same as ${this.groupName}`
    }
}
