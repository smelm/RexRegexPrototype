import { Parser } from "./Parser"
import { err, ok, ParseResult } from "./ParseResult"
import { Alternative } from "./Alternative"
import { SequenceParser } from "./Sequence"

import * as EXP from "./ast"
import { newlines, optionalSpaces, spaces } from "./commonParsers"
import { number } from "./NumberParser"
import { Repeat } from "./Repeat"
import { END, MANY, MAYBE, OF, TO } from "./keywords"
import { escapeNewlines } from "./utils"
import { Any } from "./Any"

// TODO: does the dsl need quote escaping?
/* ab"c can also be done via
 *  "ab"
 *  QUOTE
 *  c
 */

export class Literal extends Parser {
    parse(input: string): ParseResult {
        if (input[0] !== '"') {
            return err(
                input,
                `expected string literal to start with " but got ${escapeNewlines(input)}`
            )
        }

        const closingQuote = input.indexOf('"', 1)

        if (closingQuote === -1) {
            return err(input, `not closed string literal, ${escapeNewlines(input)}`)
        }

        const content = input.slice(1, closingQuote)
        const remaining = input.slice(closingQuote + 1)

        // include both quotes
        const matched = input.slice(0, closingQuote + 1)

        const result = ok(EXP.literal(content), matched, remaining)
        return result
    }
}

export class ExpressionParser extends Parser {
    private parser: Parser

    constructor() {
        super()
        this.parser = this.makeParser()
    }

    private makeParser(): Parser {
        const expression = this
        const _ = spaces

        const expressionOrBlock = generateExprOrBlockParser(expression)

        const literal = new Literal()

        const any = Any.parser

        const maybe = new SequenceParser([MAYBE, expressionOrBlock]).builder(
            ([expr]: EXP.Expression[]) => EXP.maybe(expr)
        )

        const manyOf = new SequenceParser([MANY, _, OF, expressionOrBlock]).builder(
            (value: EXP.Expression[]) => EXP.manyOf(value[0])
        )

        const countOf = new SequenceParser([number, _, OF, expressionOrBlock]).builder(
            (value: any[]) => EXP.countOf(value[0], value[1])
        )

        const countRangeOf = new SequenceParser([
            number,
            _,
            TO,
            _,
            number,
            _,
            OF,
            expressionOrBlock,
        ]).builder((value: any[]) => EXP.countRangeOf(value[0], value[1], value[2]))

        const expressions = [literal, any, maybe, manyOf, countOf, countRangeOf]

        return new Alternative(expressions)
    }

    parse(input: string): ParseResult {
        return this.parser.parse(input)
    }
}

function generateExprOrBlockParser(expression: Parser): Parser {
    return new Alternative([
        new SequenceParser([spaces, expression]).builder(([exp]: EXP.Expression[]) => exp),
        generateBlockParser(expression),
    ])
}

function generateBlockParser(expression: Parser): Parser {
    return new SequenceParser([
        optionalSpaces,
        newlines,
        new Repeat(
            new SequenceParser([optionalSpaces, expression, optionalSpaces, newlines]).builder(
                ([val]: EXP.Expression[]) => val
            )
        ),
        END,
    ]).builder(([seq, _end]: EXP.Expression[][]) => {
        if (seq.length === 1) {
            return seq[0]
        } else {
            return EXP.sequence(seq)
        }
    })
}

export const expression = new ExpressionParser()
export const expressionOrBlock = generateExprOrBlockParser(expression)
