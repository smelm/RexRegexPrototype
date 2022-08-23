import { Expression, group } from "./ast"
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
    either: string("either").desc("either"),
    or: string("or").desc("or"),
}

function debug<T>(label: string): (result: T) => Parser<T> {
    return function (result: T) {
        console.log(label, result)
        return succeed(result)
    }
}

const statementSeperator: Parser<string> = regex(/( *[\n\r] *)+/)

type BlockResult<T> = { header: T; content: Expression }

function line<T>(header: Parser<T>, expression: Parser<Expression>): Parser<BlockResult<T>> {
    return seqObj<BlockResult<T>>(["header", header], _, ["content", expression])
}

function block<T>(
    header: Parser<T>,
    expressionSequence: Parser<Expression>
): Parser<BlockResult<T>> {
    return seqObj<{ header: any; content: any }>(
        ["header", header],
        statementSeperator,
        ["content", expressionSequence],
        statementSeperator,
        kw.end
    )
}

function lineOrBlock<T>(
    header: Parser<T>,
    expression: Parser<Expression>,
    expressionSequence: Parser<Expression>
): Parser<BlockResult<T>> {
    return alt(block(header, expressionSequence), line(header, expression))
}

type RepeatBounds = { lower: number; upper: number | "many" | "lower"; exp: Expression }

export function parse(input: string): Expression {
    const QUOTE: Parser<string> = string('"')
    const identifier: Parser<string> = regex(/[a-zA-Z]\w*/)

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
        expression: r =>
            alt(r.any, r.literal, r.rangeTimes, r.many, r.maybe, r.alternative, r.group).desc(
                "expression"
            ),
        any: () => kw.any.map(builders.any),
        literal: () => regex(/[^"]+/).wrap(QUOTE, QUOTE).map(builders.literal),
        upperBound: r =>
            seq(_, kw.to, _)
                .then(alt(r.number, string("many")))
                .or(of("lower")),
        rangeHeader: r =>
            seqObj<RepeatBounds>(["lower", r.number], ["upper", r.upperBound], _, kw.of),
        rangeTimes: r =>
            lineOrBlock<RepeatBounds>(r.rangeHeader, r.expression, r.expressionSequence).map(
                ({ header, content }: BlockResult<RepeatBounds>) => {
                    const { lower, upper } = header
                    if (upper === "lower") {
                        return builders.repeat(content, lower, lower)
                    } else if (upper === "many") {
                        return builders.repeat(content, lower, undefined)
                    } else {
                        return builders.repeat(content, lower, upper)
                    }
                }
            ),
        many: r =>
            lineOrBlock<never>(seq(kw.many, _, kw.of), r.expression, r.expressionSequence).map(
                ({ content }: BlockResult<never>) => builders.manyOf(content)
            ),
        maybe: r =>
            lineOrBlock<never>(kw.maybe, r.expression, r.expressionSequence).map(
                ({ content }: BlockResult<never>) => builders.maybe(content)
            ),
        group: r =>
            lineOrBlock<string>(
                kw.begin.then(_).then(identifier),
                r.expression,
                r.expressionSequence
            ).map(({ header, content }: BlockResult<string>) => group(header, content)),
        alternative: r =>
            lineOrBlock(
                kw.either,
                sepBy(r.expression, seq(_, kw.or, _)).map((exps: Expression[]) =>
                    builders.alternative(...exps)
                ),
                sepBy(r.expressionSequence, seq(statementSeperator, kw.or, statementSeperator)).map(
                    (exps: Expression[]) => builders.alternative(...exps)
                )
            ).map(({ content }: BlockResult<any>) => content),
        number: () => regex(/[0-9]+/).map(Number),
    })

    let result = dslParser.expressionSequence.tryParse(input)

    return result
}
