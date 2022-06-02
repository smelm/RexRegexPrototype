import { Parser } from "./Parser"
import { ParseResult } from "./ParseResult"
import { Alternative } from "./Alternative"
import { Sequence } from "./Sequence"

import * as EXP from "../expression"
import { newlines, optionalSpaces, spaces } from "./commonParsers"
import { number } from "./NumberParser"
import { Repeat } from "./Repeat"
import { ANY, END, MANY, MAYBE, OF, TO } from "./keywords"

export class Expression extends Parser {
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

        const expressions = [any, maybe, manyOf, countOf, countRangeOf]

        return new Alternative(expressions)
    }

    parse(input: string): ParseResult {
        return this.parser.parse(input)
    }
}
