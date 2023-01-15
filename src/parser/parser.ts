import { Expression, ExpressionType } from "../ast"
import {
    alt,
    Parser,
    createLanguage,
    Language,
    whitespace as _,
    seq,
    sepBy,
    Rule,
    regex,
    string,
} from "parsimmon"
import * as builders from "../ast/astBuilders"
import { DSLScript } from "../ast/DSLScript"
import { preamble } from "./preamble"
import { DUMMY } from "./Dummy"

import { alternative } from "./alternative"
import { characterClass } from "./characterClass"
import { notBut } from "./notBut"
import { quantifiers } from "./quantifiers"
import { groups } from "./groups"
import { parseMacros } from "./macros"

import { statementSeperator, optionalStatementSeperator, opt } from "./utils"
import { kw } from "./keywords"

const QUOTE: Parser<string> = string('"')

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

// the type is { str: { str: Expression }} with any nesting depth
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
