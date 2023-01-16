import { Expression, ExpressionType } from "../ast/Expression"
import {
    alternative,
    any,
    anyOf,
    digit,
    literal,
    manyOf,
    repeat,
    sequence,
} from "../ast/astBuilders"
import { RandomSeed } from "random-seed"
import { RegexEngine } from "../engines"

class NegativeLookAhead extends Expression {
    constructor(private child: Expression) {
        super(ExpressionType.CUSTOM)
    }

    positiveTestCases(_ast: Expression, _rng: RandomSeed): string[] {
        throw new Error("Method not implemented.")
    }

    negativeTestCases(_ast: Expression, _rng: RandomSeed): string[] {
        throw new Error("Method not implemented.")
    }

    toRegex(engine: RegexEngine): string {
        return `(?!${this.child.toRegex(engine)})`
    }

    toString(): string {
        throw new Error("Method not implemented.")
    }

    toDSL(_identLevel: number): string {
        throw new Error("Method not implemented.")
    }
}

export function surroundWith(begin: string, end: string = ""): Expression {
    if (!end) {
        end = begin
    }
    return sequence(
        literal(begin),
        manyOf(sequence(new NegativeLookAhead(literal(end)), any())),
        literal(end)
    )
}

export function numberBetween(
    lower: number,
    upper: number,
    { leadingZeroes = false }: { leadingZeroes?: boolean } = {}
): Expression {
    if (lower > upper) {
        throw new Error(`lower ${lower} is bigger than upper ${upper}`)
    }

    let upperDigits = String(upper)
        .split("")
        .map(d => Number.parseInt(d))
    let lowerDigits = String(lower)
        .split("")
        .map(d => Number.parseInt(d))
    // padding
    lowerDigits = [...new Array(upperDigits.length - lowerDigits.length).fill(0), ...lowerDigits]

    let lowerPrefix = ""
    let upperPrefix = ""
    const alternatives = []

    for (let [l, u] of zip(lowerDigits, upperDigits)) {
        const paddingLength = upperDigits.length - upperPrefix.length - 1
        const padding = paddingLength > 0 ? [repeat(digit(), paddingLength, paddingLength)] : []

        if (lowerPrefix === upperPrefix) {
            if (u - l >= 2) {
                alternatives.push(
                    sequence(
                        ...(upperPrefix.length > 0 ? [literal(upperPrefix)] : []),
                        anyOf([(l + 1).toString(), (u - 1).toString()]),
                        ...padding
                    )
                )
            }
        } else {
            // lower
            if (l < 9) {
                alternatives.push(
                    sequence(literal(lowerPrefix), anyOf([(l + 1).toString(), "9"]), ...padding)
                )
            }

            // upper
            if (u > 0) {
                alternatives.push(
                    sequence(literal(upperPrefix), anyOf(["0", (u - 1).toString()]), ...padding)
                )
            }
        }

        if (l !== 0 || leadingZeroes) {
            lowerPrefix += l.toString()
        }
        upperPrefix += u.toString()
    }
    return alternative(...alternatives)
}

function zip(...arrays: any): any {
    return Array.apply(null, Array(arrays[0].length)).map(function (_, i) {
        return arrays.map(function (array: any) {
            return array[i]
        })
    })
}

export function separatedBy(sep: string, optional: string = ""): (exp: Expression) => Expression {
    if (optional === "optional") {
        return (exp: Expression) => sequence(exp, repeat(sequence(literal(sep), exp), 0))
    } else {
        return (exp: Expression) => sequence(exp, manyOf(sequence(literal(sep), exp)))
    }
}

function wrappedIn(
    begin: string | Expression,
    end: string | Expression
): (exp: Expression) => Expression {
    return (e: Expression) => wrapIn(begin, end ? end : begin, e) as any
}

export function wrapIn(
    begin: string | Expression,
    end: string | Expression,
    exp?: Expression
): Expression | ((e: Expression) => Expression) {
    if (!exp) {
        exp = end as Expression
        end = begin
    }

    if (typeof begin === "string") {
        begin = literal(begin)
    }

    if (typeof end === "string") {
        end = literal(end)
    }

    const result = sequence(begin, exp, end)
    return result
}

export const stdLib = {
    separatedBy,
    wrapIn,
    wrappedIn,
}
