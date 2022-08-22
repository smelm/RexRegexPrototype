import { Expression } from "./ast"
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
    sepBy,
    succeed,
} from "parsimmon"
import * as builders from "./ast/astBuilders"

export * from "./ast"

const kw = {
    any: string("any").desc("any"),
    maybe: string("maybe").desc("maybe"),
    many: string("many").desc("many"),
    of: string("of").desc("of"),
    to: string("to").desc("to"),
    end: string("end").desc("end"),
    begin: string("begin").desc("begin"),
}

function debug(label: string): Parser {
    return function (result: any) {
        console.log(label, result)
        return succeed(result)
    }
}

const statementSeperator: Parser<string> = regex(/( *[\n\r] *)+/)

function block(
    header: Parser<any>,
    expression: Parser<Expression>,
    expressionSequence: Parser<Expression[]>
): Parser<Expression> {
    return alt(
        header
            .then(statementSeperator)
            .then(expressionSequence)
            .skip(statementSeperator)
            .skip(kw.end),
        header.then(_).then(expression)
    )
}

export function parse(input: string): Expression {
    const QUOTE: Parser<string> = string('"')

    const dslParser: Language = createLanguage({
        expressionSequence: r =>
            sepBy(r.expression, statementSeperator)
                .map((expr: Expression[]) => {
                    if (expr.length === 1) {
                        return expr[0]
                    } else {
                        return builders.sequence(expr)
                    }
                })
                .desc("expression sequence"),
        expression: r => alt(r.any, r.literal, r.rangeTimes, r.many, r.maybe).desc("expression"),
        any: () => kw.any.map(builders.any),
        literal: () => regex(/[^"]+/).wrap(QUOTE, QUOTE).map(builders.literal),
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
            block(seq(kw.many, _, kw.of), r.expression, r.expressionSequence).map(builders.manyOf),
        maybe: r => block(kw.maybe, r.expression, r.expressionSequence).map(builders.maybe),
        number: () => regex(/[0-9]+/).map(Number),
    })

    let result = dslParser.expressionSequence.tryParse(input)

    return result
}
