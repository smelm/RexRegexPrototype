import { Parser } from "./Parser"
import { ParseResult } from "./ParseResult"
import { Alternative } from "./Alternative"
import { StringParser } from "./StringParser"
import { Sequence } from "./Sequence"

import * as EXP from "../expression"
import { newlines, spaces } from "./commonParsers"
import { NumberParser } from "./NumberParser"

export class Expression extends Parser {
    parse(input: string): ParseResult {
        const expression = this

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

        const block = new Sequence([newlines, expression, newlines, kw.end]).builder(
            (seq: EXP.Expression[]) => {
                // drop last since it is end keyword
                seq = seq.slice(0, seq.length - 1)
                if (seq.length === 1) {
                    return seq[0]
                } else {
                    return EXP.sequence(seq)
                }
            }
        )

        const expressionOrBlock = new Alternative([new Sequence([spaces, expression]), block])

        const maybe = new Sequence([kw.maybe, expressionOrBlock]).builder(
            (value: EXP.Expression[]) => EXP.maybe(value[1])
        )

        const manyOf = Sequence.tokens(kw.many, kw.of, expressionOrBlock).builder(
            (value: EXP.Expression[]) => EXP.manyOf(value[2])
        )

        const countOf = Sequence.tokens(number, kw.of, expression).builder((value: any[]) =>
            EXP.countOf(value[0], value[2])
        )

        const countRangeOf = Sequence.tokens(number, kw.to, number, kw.of, expression).builder(
            (value: any[]) => EXP.countRangeOf(value[0], value[2], value[4])
        )

        const expressions = [any, maybe, manyOf, countOf, countRangeOf]

        return new Alternative(expressions).parse(input)
    }
}
