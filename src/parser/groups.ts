import { Rule, seq, whitespace as _ } from "parsimmon"
import { line, lineOrBlock } from "./utils"
import { Expression } from "../ast"
import * as builders from "../ast"
import { kw } from "./keywords"

export const groups: Rule = {
    group: r =>
        lineOrBlock<string, Expression>(
            kw.named.then(_).then(r.identifierName),
            r.expression,
            r.expressionSequence
        ).map(({ header, content }) => builders.group(header, content)),
    backreference: r =>
        line(seq(kw.same, _, kw.as), r.identifierName).map(({ content: groupName }) =>
            builders.backreference(groupName)
        ),
}
