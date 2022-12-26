import { Language, Parser, regex, seq, seqObj, string, whitespace as _ } from "parsimmon"
import { RandomSeed } from "random-seed"
import { Expression, ExpressionType, literal, manyOf, sequence } from "./ast"
import { RandomGenerator } from "./RandomGenerator"

export interface Rule {
    name: string
    parser: (r: Language) => Parser<Expression>
}

export abstract class Library {
    constructor(public readonly rules: Rule[]) {}
}

export class SeparatedBy extends Expression {
    constructor(private child: Expression, private separator: string) {
        super(ExpressionType.DUMMY)
    }

    toRegex(): string {
        return sequence(this.child, manyOf(sequence(literal(this.separator), this.child))).toRegex()
    }

    toString(): string {
        return `separatedBy(${this.child.toString()}, ${this.separator.toString()})`
    }

    generateValid(_ast: Expression, _rng: RandomGenerator): string[] {
        throw new Error("Method not implemented.")
    }
    generateInvalid(_ast: Expression, _rng: RandomGenerator): string[] {
        throw new Error("Method not implemented.")
    }
}

export function separatedBy(child: Expression, separator: string): Expression {
    return new SeparatedBy(child, separator)
}

export class SeparatedByParser extends Library {
    constructor() {
        super([
            {
                name: "separatedBy",
                parser: r =>
                    seqObj(
                        ["separator", regex(/[^\s]+/).desc("separator")],
                        _,
                        string("separating"),
                        _,
                        ["child", r.expression]
                    ).map(({ child, separator }: any) => {
                        return separatedBy(child, separator)
                    }),
            },
        ])
    }
}
