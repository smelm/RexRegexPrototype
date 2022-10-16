import { Character, Expression, ExpressionType, group } from "./ast"
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
    newline,
    whitespace,
} from "parsimmon"
import * as builders from "./ast/astBuilders"
import { WrappingExpression } from "./ast/WrappingExpression"
import { RandomSeed } from "random-seed"
import { DSLScript } from "./ast/DSLScript"

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
    define: string("define").desc("define"),
}

function debug<T>(label: string): (result: T) => Parser<T> {
    return function (result: T) {
        console.log(label, result)
        return succeed(result)
    }
}

const statementSeperator: Parser<string> = regex(/( *[\n\r] *)+/).desc("statement_separator")
const optionalStatementSeperator: Parser<string> = regex(/( *[\n\r] *)*/)

type BlockResult<T, U> = { header: T; content: U; type: "block" | "line" }

function line<T, U>(header: Parser<T>, expression: Parser<U>): Parser<BlockResult<T, U>> {
    return seqObj<BlockResult<T, U>>(["header", header], _, ["content", expression]).map(obj => ({
        ...obj,
        type: "line",
    }))
}

function block<T, U>(header: Parser<T>, content: Parser<U>): Parser<BlockResult<T, U>> {
    return seqObj<{ header: any; content: any }>(
        ["header", header],
        statementSeperator,
        ["content", content],
        statementSeperator,
        kw.end
    ).map(obj => ({ ...obj, type: "block" }))
}

function lineOrBlock<T, U>(
    header: Parser<T>,
    content: Parser<U>,
    contentSequence: Parser<U>
): Parser<BlockResult<T, U>> {
    return alt(block(header, contentSequence), line(header, content))
}

type RepeatBounds = { lower: number; upper: number | "many" | "lower"; exp: Expression }

class Dummy extends Expression {
    constructor() {
        super(ExpressionType.DUMMY)
    }
    generateValid(_rng: RandomSeed): string[] {
        throw new Error("Method not implemented.")
    }
    generateInvalid(_rng: RandomSeed): string[] {
        throw new Error("Method not implemented.")
    }
    toRegex(): string {
        throw new Error("Method not implemented.")
    }
    toString(): string {
        throw new Error("Method not implemented.")
    }
}

const DUMMY = new Dummy()

export function makeDSLParser(variables: Record<string, Expression> = {}): Parser<DSLScript> {
    const QUOTE: Parser<string> = string('"')
    const letter: Parser<string> = regex(/[a-zA-Z]/)

    const dslParser: Language = createLanguage({
        dslScript: r => r.expressionSequence.trim(optionalStatementSeperator),
        expressionSequence: r =>
            sepBy(r.expressionWithTrailingComment, statementSeperator)
                .map((expr: Expression[]) => {
                    expr = expr.filter(e => e.type !== ExpressionType.DUMMY)

                    if (expr.length === 1) {
                        return expr[0]
                    } else {
                        return builders.sequence(expr)
                    }
                })
                .desc("expression sequence"),
        expressionWithTrailingComment: r => r.expression.skip(seq(_, r.comment).atMost(1)),
        expression: r =>
            alt(
                r.comment,
                r.literal,
                r.rangeTimes,
                r.many,
                r.maybe,
                r.alternative,
                r.group,
                r.variableDefinition,
                r.characterClass,
                r.any,
                r.variable
            ).desc("expression"),
        comment: () => seq(string("#"), regex(/.*/)).result(DUMMY),
        any: () => kw.any.map(builders.any),
        literal: () => regex(/[^"]+/).wrap(QUOTE, QUOTE).map(builders.literal),
        upperBound: r =>
            seq(_, kw.to, _)
                .then(alt(r.number, string("many")))
                .or(of("lower")),
        rangeHeader: r =>
            seqObj<RepeatBounds>(["lower", r.number], ["upper", r.upperBound], _, kw.of),
        rangeTimes: r =>
            lineOrBlock<RepeatBounds, Expression>(
                r.rangeHeader,
                r.expression,
                r.expressionSequence
            ).map(({ header, content }) => {
                const { lower, upper } = header
                if (upper === "lower") {
                    return builders.repeat(content, lower, lower)
                } else if (upper === "many") {
                    return builders.repeat(content, lower, undefined)
                } else {
                    return builders.repeat(content, lower, upper)
                }
            }),
        many: r =>
            lineOrBlock<any, Expression>(
                seq(kw.many, _, kw.of),
                r.expression,
                r.expressionSequence
            ).map(({ content }: BlockResult<any, Expression>) => builders.manyOf(content)),
        maybe: r =>
            lineOrBlock<any, Expression>(kw.maybe, r.expression, r.expressionSequence).map(
                ({ content }) => builders.maybe(content)
            ),
        group: r =>
            lineOrBlock<string, Expression>(
                kw.begin.then(_).then(r.identifier),
                r.expression,
                r.expressionSequence
            ).map(({ header, content }) => group(header, content)),
        alternative: r =>
            lineOrBlock(
                kw.either,
                sepBy(r.expression, seq(_, kw.or, _)).map((exps: Expression[]) =>
                    builders.alternative(...exps)
                ),
                sepBy(r.expressionSequence, seq(statementSeperator, kw.or, statementSeperator)).map(
                    (exps: Expression[]) => builders.alternative(...exps)
                )
            ).map(({ content }) => content),
        variableDefinition: r =>
            lineOrBlock(kw.define.then(_).then(r.identifier), r.expression, r.expressionSequence)
                .assert(
                    ({ header: name }) => !(name in variables),
                    "duplicate identifier definition"
                )
                .chain(({ header: name, content }) =>
                    makeDSLParser({ ...variables, [name]: content })
                ),
        variable: r =>
            r.identifier.assert(n => n in variables, "undefined variables").map(n => variables[n]),
        characterClassList: r =>
            sepBy(
                alt(
                    seq(letter, seq(_, kw.to, _), letter).map(([lower, _ws, upper]) => [
                        lower,
                        upper,
                    ]),
                    letter
                ),
                regex(/ *, */).desc("list_separator")
            ),
        characterClass: r =>
            lineOrBlock(
                seq(kw.any, _, kw.of),
                r.characterClassList,
                sepBy(r.characterClassList, statementSeperator.notFollowedBy(kw.end))
            ).map(({ content, type }) => {
                let chars
                if (type === "block") {
                    //unwrap from list
                    chars = []
                    for (let l of content) {
                        chars.push(...l)
                    }
                } else {
                    chars = content
                }
                return builders.characterClass(...chars)
            }),
        identifier: () => regex(/[a-zA-Z]\w*/),
        number: () => regex(/[0-9]+/).map(Number),
    })

    return dslParser.dslScript.map(expression => {
        if (expression.type === ExpressionType.SCRIPT) {
            return expression
        } else {
            return new DSLScript(expression)
         }
    })
}
