import { Parser } from "./Parser"
import { err, ok, ParseResult } from "./ParseResult"
import { Alternative } from "./Alternative"
import { Sequence } from "./Sequence"

import * as EXP from "../expression"
import { newlines, optionalSpaces, spaces } from "./commonParsers"
import { number } from "./NumberParser"
import { Repeat } from "./Repeat"
import { ANY, END, MANY, MAYBE, OF, TO } from "./keywords"
import { escapeNewlines } from "./utils"

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

        const block = new Sequence([
            optionalSpaces,
            newlines,
            new Repeat(
                new Sequence([optionalSpaces, expression, optionalSpaces, newlines]).builder(
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

        const expressionOrBlock = new Alternative([
            new Sequence([spaces, expression]).builder(([exp]: EXP.Expression[]) => exp),
            block,
        ])

        const literal = new Literal()

        const any = ANY.builder(() => EXP.any())

        const maybe = new Sequence([MAYBE, expressionOrBlock]).builder(([expr]: EXP.Expression[]) =>
            EXP.maybe(expr)
        )

        const manyOf = new Sequence([MANY, _, OF, expressionOrBlock]).builder(
            (value: EXP.Expression[]) => EXP.manyOf(value[0])
        )

        const countOf = new Sequence([number, _, OF, expressionOrBlock]).builder((value: any[]) =>
            EXP.countOf(value[0], value[1])
        )

        const countRangeOf = new Sequence([
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
