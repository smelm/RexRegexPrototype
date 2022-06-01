import { Parser } from "./Parser"
import { ParseResult } from "./ParseResult"
import { Alternative } from "./Alternative"
import { StringParser } from "./StringParser"
import { Sequence } from "./Sequence"

import * as EXP from "../expression"
import { newlines, spaces } from "./commonParsers"
import { NumberParser } from "./NumberParser"
import { Repeat } from "./Repeat"

export class Expression extends Parser {
    parse(input: string): ParseResult {
        const expression = this
        const _ = spaces

        const number = new NumberParser()

        const kw = {
            any: new StringParser("any", EXP.any()),
            maybe: new StringParser("maybe"),
            many: new StringParser("many"),
            of: new StringParser("of"),
            to: new StringParser("to"),
            end: new StringParser("end"),
        }

        const any = kw.any

        const block = new Sequence([
            newlines,
            new Repeat(
                new Sequence([expression, newlines]).builder(([val]: EXP.Expression[]) => val)
            ),
            kw.end,
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

        const maybe = new Sequence([kw.maybe, expressionOrBlock]).builder(
            ([_maybe, expr]: EXP.Expression[]) => EXP.maybe(expr)
        )

        const manyOf = new Sequence([kw.many, _, kw.of, expressionOrBlock]).builder(
            (value: EXP.Expression[]) => EXP.manyOf(value[2])
        )

        const countOf = new Sequence([number, _, kw.of, expressionOrBlock]).builder(
            (value: any[]) => EXP.countOf(value[0], value[2])
        )

        const countRangeOf = new Sequence([
            number,
            _,
            kw.to,
            _,
            number,
            _,
            kw.of,
            expressionOrBlock,
        ]).builder((value: any[]) => EXP.countRangeOf(value[0], value[2], value[4]))

        const expressions = [any, maybe, manyOf, countOf, countRangeOf]

        return new Alternative(expressions).parse(input)
    }
}
