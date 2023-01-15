import { backreference, Expression, ExpressionType, group } from "../ast"
import {
    alt,
    Parser,
    regex,
    string,
    createLanguage,
    seqObj,
    Language,
    Rule,
    whitespace as _,
    of,
    seq,
    sepBy,
    sepBy1,
} from "parsimmon"
import * as builders from "../ast/astBuilders"
import { DSLScript } from "../ast/DSLScript"
import { stdLib } from "../lib"
import { DUMMY } from "./Dummy"
import { preamble } from "./preamble"

import { alternative } from "./alternative"
import { characterClass } from "./characterClass"
import { notBut } from "./notBut"
import { quantifiers } from "./quantifiers"

import { kw, isKeyword } from "./keywords"
import {
    lineOrBlock,
    line,
    block,
    statementSeperator,
    optionalStatementSeperator,
    DOT,
    opt,
} from "./utils"

const QUOTE: Parser<string> = string('"')

const groups: Rule = {
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
}

function parseMacros(variables: any): Rule {
    return {
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
        funcArgs: r =>
            sepBy1(alt(r.rawLiteral, r.variable), opt(_).then(regex(/ *, */))).desc("args"),
        functionCall: r =>
            seq(r.variable, r.funcArgs.wrap(string("("), string(")"))).map(([func, args]) => {
                return func(...args)
            }),
        blockFunctionCall: r =>
            block(kw.begin.skip(_).then(alt(r.functionCall, r.variable)), r.expressionSequence).map(
                ({ header, content }) => {
                    return header(content)
                }
            ),
        identifier: r =>
            sepBy1(r.identifierName, DOT).assert(
                ident => !ident.some(isKeyword),
                "keyword cannot be used in variable names"
            ),
        identifierName: () => regex(/[a-zA-Z]\w*/),
    }
}

const any: Rule = {
    any: () => kw.any.map(builders.any),
}

const literal: Rule = {
    rawLiteral: () => regex(/[^"]+/).wrap(QUOTE, QUOTE),
    literal: r => r.rawLiteral.map(builders.literal),
}

const comment: Rule = {
    comment: () => seq(string("#"), regex(/.*/)).result(DUMMY),
}

// TODO is there a better type for variables
// it was Record<string, Expression>
// but now it is Record<Record<string, Expression>> with varying levels of depth
export function makeDSLParser(variables: any = {}): Parser<DSLScript> {
    const dslParser: Language = createLanguage({
        dslScript: r =>
            seq(opt(r.preamble.skip(statementSeperator)), r.script).trim(
                optionalStatementSeperator
            ),
        preamble: () => preamble,
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
                r.blockFunctionCall,
                r.functionCall,
                r.variable,
                r.backreference
            ).desc("expression"),
        ...comment,
        ...any,
        ...literal,
        ...quantifiers,
        ...alternative,
        ...characterClass,
        ...notBut,
        ...parseMacros(variables),
        ...groups,
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
        DOUBLE_QUOTE: builders.literal('"'),
        SPACE: builders.whitespace(),
        DIGIT: builders.digit(),
        LETTER: {
            EN: builders.letter("EN"),
            DE: builders.letter("DE"),
        },
    }

    return makeDSLParser({ ...CONSTANTS, ...stdLib, ...variables })
}
