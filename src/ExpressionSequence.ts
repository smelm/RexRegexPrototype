import { BaseParser } from "./Parser"
import { ParseResult } from "./ParseResult"
import * as AST from "./ast"
import { SequenceParser, Repeat, newlines, optionalSpaces } from "./commonParsers"
import { expression } from "./Expression"

export class ExpressionSequenceParser extends BaseParser {
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
        return this.parser.parse(input)
    }
}
