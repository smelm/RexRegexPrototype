import { Parser } from "./Parser"
import { ParseResult } from "./ParseResult"
import { SequenceParser } from "./Sequence"
import * as AST from "./ast"
import { newlines, optionalSpaces } from "./commonParsers"
import { Repeat } from "./Repeat"
import { expression } from "./Expression"

export class ExpressionSequenceParser extends Parser {
    private parser = new SequenceParser([
        optionalSpaces,
        expression,
        optionalSpaces,
        new Repeat(
            new SequenceParser([newlines, optionalSpaces, expression, optionalSpaces]).builder(
                (exp: AST.Expression[]) => exp[0]
            ),
            true
        ),
    ]).builder(([head, tail]: [AST.Expression, AST.Expression[]]) => {
        const seq = [head, ...tail]

        if (seq.length === 1) {
            return seq[0]
        } else {
            return AST.sequence(seq)
        }
    })

    parse(input: string): ParseResult {
        const result = this.parser.parse(input)
        // console.log(result)
        return result
    }
}
