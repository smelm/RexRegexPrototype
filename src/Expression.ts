import { CustomParser } from "./Parser"
import { ParseResult } from "./ParseResult"
import { Alternative } from "./Alternative"
import { SequenceParser } from "./Sequence"

import * as AST from "./ast"
import { newlines, optionalSpaces, spaces } from "./commonParsers"
import { number } from "./NumberParser"
import { Repeat } from "./Repeat"
import { END, MANY, MAYBE, OF, TO } from "./keywords"
import { LiteralParser } from "./Literal"

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
    const _ = spaces

    const literal = new LiteralParser()

    const any = AST.Any.parser

    const maybe = new SequenceParser([MAYBE, expressionOrBlock]).builder(
        ([expr]: AST.Expression[]) => AST.maybe(expr)
    )

    const manyOf = new SequenceParser([MANY, _, OF, expressionOrBlock]).builder(
        (value: AST.Expression[]) => AST.manyOf(value[0])
    )

    const countOf = AST.CountOf.parser

    const countRangeOf = AST.CountRangeOf.parser

    const expressions = [literal, any, maybe, manyOf, countOf, countRangeOf]

    return new Alternative(expressions).parse(input)
}
