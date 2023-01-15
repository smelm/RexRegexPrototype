import { Rule, seq, whitespace as _ } from "parsimmon"
import { kw } from "./keywords"
import { line, lineOrBlock } from "./utils"
import * as builders from "../ast"

export const notBut: Rule = {
    notBut: r =>
        seq(
            line(kw.not, r.expression).skip(_),
            lineOrBlock(kw.but, r.expression, r.expressionSequence)
        ).map(x => {
            const [not, but] = x
            return builders.notBut(not.content, but.content)
        }),
}
