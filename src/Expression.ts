import { CustomParser } from "./Parser"
import { ParseResult } from "./ParseResult"

import * as AST from "./ast"
import { SequenceParser, AlternativeParser, Repeat, newlines, optionalSpaces, spaces } from "./commonParsers"
import { END } from "./keywords"
import { InputExample, InputGenerator } from "./Generator"
import { RandomGenerator } from "./RandomGenerator"

export class Expression implements InputGenerator {
    constructor(public type: AST.ExpressionType, public value: any) {}

    generate(valid: boolean, rng: RandomGenerator): InputExample[] {
        throw new Error("not implemented")
    }

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
    const countRangeOf = AST.Repeat.parser

    const expressions = [literal, any, maybe, countRangeOf]

    return new AlternativeParser(expressions).parse(input)
}
