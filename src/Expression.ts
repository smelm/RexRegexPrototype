import { CustomParser } from "./Parser"
import { ParseResult } from "./ParseResult"

import * as AST from "./ast"
import {
    SequenceParser,
    AlternativeParser,
    Repeat,
    newlines,
    optionalSpaces,
    spaces,
} from "./commonParsers"
import { END } from "./keywords"

export class Expression {
    constructor(public type: AST.ExpressionType, public value: any) {}

    toString(): string {
        return `${this.type}(${this.value.toString()})`
    }
}

export const expression = new CustomParser(parseExpression)

const block = new SequenceParser([
    optionalSpaces,
    newlines,
    new Repeat(
        new SequenceParser([optionalSpaces, expression, optionalSpaces, newlines]).builder(
            ([val]: Expression[]) => val
        )
    ),
    END,
]).builder(([seq, _end]: Expression[][]) => {
    if (seq.length === 1) {
        return seq[0]
    } else {
        return AST.sequence(seq)
    }
})

export const expressionOrBlock = new AlternativeParser([
    new SequenceParser([spaces, expression]).builder(([exp]: Expression[]) => exp),
    block,
])

function parseExpression(input: string): ParseResult {
    const literal = AST.Literal.parser
    const any = AST.Any.parser
    const maybe = AST.Maybe.parser
    const manyOf = AST.ManyOf.parser
    const countRangeOf = AST.Repeat.parser

    const expressions = [literal, any, maybe, manyOf, countRangeOf]

    return new AlternativeParser(expressions).parse(input)
}
