import { backreference, Expression, ExpressionType, group } from "./ast"
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
    sepBy1,
} from "parsimmon"
import * as builders from "./ast/astBuilders"
import { DSLScript, PositionInInput, ScriptSettings } from "./ast/DSLScript"
import { RandomGenerator } from "./RandomGenerator"

const kw = Object.fromEntries(
    [
        "any",
        "maybe",
        "many",
        "of",
        "to",
        "end",
        "named",
        "either",
        "or",
        "define",
        "same",
        "as",
        "except",
        "not",
        "but",
    ].map(ident => [ident, string(ident).desc(ident)])
)

function isKeyword(word: string): boolean {
    return Object.keys(kw).includes(word)
}

function opt<T>(p: Parser<T>): Parser<T> {
    return p.atMost(1).map(x => x[0])
}

const DOT = string(".").desc("DOT")

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

    generateValid(_tree: Expression, _rng: RandomGenerator): string[] {
        throw new Error("Method not implemented.")
    }

    generateInvalid(_tree: Expression, _rng: RandomGenerator): string[] {
        throw new Error("Method not implemented.")
    }

    toRegex(): string {
        throw new Error("Method not implemented.")
    }

    toString(): string {
        throw new Error("Method not implemented.")
    }

    toDSL(level: number): string {
        throw new Error("Method not implemented.")
    }
}

const DUMMY = new Dummy()

// TODO is there a better type for variables
// it was Record<string, Expression>
// but now it is Record<Record<string, Expression>> with varying levels of depth
export function makeDSLParser(variables: any = {}): Parser<DSLScript> {
    const QUOTE: Parser<string> = string('"')
    const letter: Parser<string> = regex(/[a-zA-Z]/)

    const dslParser: Language = createLanguage({
        dslScript: r =>
            seq(opt(r.preamble.skip(statementSeperator)), r.script)
                .trim(optionalStatementSeperator)
                .map(([preamble, script]) => [preamble, script]),
        preamble: () =>
            alt(
                string("at beginning of input").map(() => PositionInInput.BEGINNING),
                string("at end of input").map(() => PositionInInput.END),
                string("somewhere in input").map(() => PositionInInput.WITHIN)
            ).map(position => new ScriptSettings(position)),
        script: r => r.expressionSequence,
        expressionSequence: r =>
            sepBy(r.expressionWithTrailingComment, statementSeperator)
                .map((expr: Expression[]) => {
                    expr = expr.filter(e => e.type !== ExpressionType.DUMMY)

                    if (expr.length === 1) {
                        return expr[0]
                    } else {
                        return builders.sequence(...expr)
                    }
                })
                .desc("expression sequence"),
        expressionWithTrailingComment: r => r.expression.skip(opt(seq(_, r.comment))),
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
                r.charClass,
                r.notBut,
                r.any,
                r.functionCall,
                r.variable,
                r.backreference
            ).desc("expression"),
        comment: () => seq(string("#"), regex(/.*/)).result(DUMMY),
        any: () => kw.any.map(builders.any),
        rawLiteral: () => regex(/[^"]+/).wrap(QUOTE, QUOTE),
        literal: r => r.rawLiteral.map(builders.literal),
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
                kw.named.then(_).then(r.identifierName),
                r.expression,
                r.expressionSequence
            ).map(({ header, content }) => group(header, content)),
        backreference: r =>
            line(seq(kw.same, _, kw.as), r.identifierName).map(({ content: groupName }) =>
                backreference(groupName)
            ),
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
        charRange: r =>
            //@ts-ignore
            seqObj(["lower", r.rawLiteral], _, kw.to, _, ["upper", r.rawLiteral]).map(
                (obj: any) => [obj.lower, obj.upper]
            ),
        charClassList: r =>
            sepBy(
                alt(r.charRange, r.rawLiteral, r.variable),
                regex(/ *, */).desc("list_separator")
            ),
        charClassHeader: () => seq(kw.any, opt(seq(_, kw.except)), _, kw.of),
        charClassListMultiline: r =>
            sepBy(r.charClassList, statementSeperator.notFollowedBy(alt(kw.except, kw.end))).map(
                x => {
                    return x.flat()
                }
            ),
        charClass: r =>
            lineOrBlock(
                r.charClassHeader,
                seq(
                    r.charClassList,
                    opt(seq(_, kw.except, _, kw.of, _, r.charClassList).map(x => x[x.length - 1]))
                ),
                seq(
                    r.charClassListMultiline,
                    opt(
                        seq(
                            statementSeperator,
                            kw.except,
                            _,
                            kw.of,
                            statementSeperator,
                            r.charClassListMultiline
                        ).map(x => x[x.length - 1])
                    )
                )
            ).map(({ content, header }) => {
                const [anyOf, except] = content
                let result
                if (header.join("").includes("except")) {
                    result = builders.anyExcept(...anyOf)
                } else {
                    result = builders.anyOf(...anyOf)
                }

                if (except) {
                    result = result.exceptOf(...except)
                }

                return result
            }),
        notBut: r =>
            seq(
                line(kw.not, r.expression).skip(_),
                lineOrBlock(kw.but, r.expression, r.expressionSequence)
            ).map(x => {
                const [not, but] = x
                console.log(x)
                return builders.notBut(not.content, but.content)
            }),
        variableDefinition: r =>
            lineOrBlock(
                kw.define.then(_).then(r.identifier).skip(_).skip(kw.as),
                r.expression,
                r.expressionSequence
            )
                .assert(
                    ({ header: name }) => !(name in variables),
                    "duplicate identifier definition"
                )
                .chain(({ header: path, content }) => {
                    let variablesCopy = { ...variables }
                    let variableName = path.pop()

                    let currentPosition = variablesCopy
                    for (let key of path) {
                        if (!currentPosition[key]) {
                            currentPosition[key] = {}
                        } else if (typeof currentPosition[key] !== "object") {
                            throw new Error("overwriting variable with namespace")
                        }
                        currentPosition = currentPosition[key]
                    }
                    currentPosition[variableName] = content
                    return makeDSLParser(variablesCopy)
                }),
        variable: r =>
            r.identifier.map(path => {
                let position = variables

                for (let key of path) {
                    position = position[key]

                    if (!position) {
                        throw new Error(`could not find ${path.join(".")}`)
                    }
                }

                return position
            }),
        funcArgs: r => sepBy1(alt(r.rawLiteral, r.variable), opt(_).then(string(","))).desc("args"),
        functionCall: r =>
            seq(r.variable, r.funcArgs.wrap(string("("), string(")"))).map(([func, args]) => {
                return func(...args)
            }),
        identifier: r =>
            sepBy1(r.identifierName, DOT).assert(
                ident => !ident.some(isKeyword),
                "keyword cannot be used in variable names"
            ),
        identifierName: () => regex(/[a-zA-Z]\w*/),
        number: () => regex(/[0-9]+/).map(Number),
    })

    return dslParser.dslScript.map(([settings, expression]) => {
        if (expression.type === ExpressionType.SCRIPT) {
            return expression
        } else {
            return new DSLScript(expression, settings)
        }
    })
}

export function makeDSL(variables: any = {}): Parser<DSLScript> {
    const CONSTANTS = {
        CHAR: {
            QUOTE: builders.literal('"'),
            COMMA: builders.literal(","),
            DOT: builders.literal("."),
        },
        DIGIT: builders.digit(),
        LETTER: {
            EN: builders.letter("EN"),
            DE: builders.letter("DE"),
        },
    }

    return makeDSLParser({ ...CONSTANTS, ...variables })
}
