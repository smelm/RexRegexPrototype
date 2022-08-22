import { countOf, Expression } from "./ast"
import {
    alt,
    Parser,
    regex,
    string,
    createLanguage,
    seqObj,
    Language,
    whitespace as _,
    of,
    seq,
} from "parsimmon"
import * as builders from "./ast/astBuilders"

export * from "./ast"

const kw = {
    any: string("any"),
    maybe: string("maybe"),
    many: string("many"),
    of: string("of"),
    to: string("to"),
    end: string("end"),
    begin: string("begin"),
}

export function parse(input: string): Expression {
    let QUOTE: Parser<string> = string('"')

    let dslParser: Language = createLanguage({
        expression: r => alt(r.any, r.literal, r.rangeTimes, r.many, r.maybe),
        any: () => kw.any.map(builders.any),
        literal: () =>
            seqObj<{ lit: string }>(QUOTE, ["lit", regex(/[^"]+/)], QUOTE).map(
                ({ lit }: Record<string, any>) => builders.literal(lit)
            ),
        nTimes: r =>
            seqObj<{ lower: number; exp: Expression }>(["lower", r.number], _, kw.of, _, [
                "exp",
                r.expression,
            ]).map(({ lower, exp }) => countOf(lower, exp)),
        upperBound: r =>
            seq(_, kw.to, _)
                .then(alt(r.number, string("many")))
                .or(of("lower")),
        rangeTimes: r =>
            seqObj<{ lower: number; upper: number | "many" | "lower"; exp: Expression }>(
                ["lower", r.number],
                ["upper", r.upperBound],
                _,
                kw.of,
                _,
                ["exp", r.expression]
            ).map(({ lower, upper, exp }) => {
                if (upper === "lower") {
                    return builders.repeat(exp, lower, lower)
                } else if (upper === "many") {
                    return builders.repeat(exp, lower, undefined)
                } else {
                    return builders.repeat(exp, lower, upper)
                }
            }),
        many: r =>
            seqObj<{ exp: Expression }>(kw.many, _, kw.of, _, ["exp", r.expression]).map(
                ({ exp }) => builders.manyOf(exp)
            ),
        maybe: r =>
            seqObj<{ exp: Expression }>(kw.maybe, _, ["exp", r.expression]).map(({ exp }) =>
                builders.maybe(exp)
            ),
        number: () => regex(/[0-9]+/).map(Number),
    })

    let result = dslParser.expression.tryParse(input)

    return result
}
