import { CustomParser } from "./Parser"
import { ParseResult } from "./ParseResult"
import { Alternative } from "./Alternative"
import { SequenceParser } from "./Sequence"

import * as AST from "./ast"
import { newlines, optionalSpaces, spaces } from "./commonParsers"
import { Repeat } from "./Repeat"
import { END } from "./keywords"

// TODO: does the dsl need quote escaping?
/* ab"c can also be done via
 *  "ab"
 *  QUOTE
 *  c
 */

export const expression = new CustomParser(parseExpression)

const block = new SequenceParser([
    optionalSpaces,
    newlines,
    new Repeat(
        new SequenceParser([optionalSpaces, expression, optionalSpaces, newlines]).builder(
            ([val]: AST.Expression[]) => val
        )
    ),
    END,
]).builder(([seq, _end]: AST.Expression[][]) => {
    if (seq.length === 1) {
        return seq[0]
    } else {
        return AST.sequence(seq)
    }
})

export const expressionOrBlock = new Alternative([
    new SequenceParser([spaces, expression]).builder(([exp]: AST.Expression[]) => exp),
    block,
])

function parseExpression(input: string): ParseResult {
    const literal = AST.Literal.parser
    const any = AST.Any.parser
    const maybe = AST.Maybe.parser
    const manyOf = AST.ManyOf.parser
    const countOf = AST.CountOf.parser
    const countRangeOf = AST.CountRangeOf.parser

    const expressions = [literal, any, maybe, manyOf, countOf, countRangeOf]

    return new Alternative(expressions).parse(input)
}
