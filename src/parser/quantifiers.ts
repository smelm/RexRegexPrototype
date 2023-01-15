import { alt, of, regex, Rule, seq, seqObj, string, whitespace as _ } from "parsimmon"
import { kw } from "./keywords"
import { Expression } from "../ast"
import * as builders from "../ast"
import { BlockResult, lineOrBlock } from "./utils"

type RepeatBounds = { lower: number; upper: number | "many" | "lower"; exp: Expression }

export const quantifiers: Rule = {
    upperBound: r =>
        seq(_, kw.to, _)
            .then(alt(r.number, string("many")))
            .or(of("lower")),
    rangeHeader: r => seqObj<RepeatBounds>(["lower", r.number], ["upper", r.upperBound], _, kw.of),
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

    number: () => regex(/[0-9]+/).map(Number),
}
