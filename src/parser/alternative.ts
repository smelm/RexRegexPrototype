import { Rule, sepBy, seq, whitespace as _ } from "parsimmon"
import { kw } from "./keywords"
import { lineOrBlock, statementSeperator } from "./utils"
import { Expression } from "../ast"
import * as builders from "../ast"

export const alternative: Rule = {
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
}
