import { Parser } from "./Parser"
import { ParseResult } from "./ParseResult"
import { Repeat } from "./Repeat"
import { Alternative } from "./Alternative"
import { StringParser } from "./StringParser"
import { Sequence } from "./Sequence"

import * as EXP from "../expression"
import { newline, newlines, spaces } from "./commonParsers"
import { ExportKeyword } from "typescript"

export class Expression extends Parser {
    parse(input: string): ParseResult {
        const expression = this
        //const newline = alternative(["\n", "\r", "\r\n"].map(str))

        const number = new Repeat(
            new Alternative("0123456789".split("").map(n => new StringParser(n)))
        ).builder(parseInt)

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

        const maybe = new Sequence([
            kw.maybe,
            new Alternative([new Sequence([spaces, expression]), block]),
        ]).builder((value: EXP.Expression[]) => EXP.maybe(value[1]))

        const manyOf = Sequence.tokens(kw.many, kw.of, expression).builder(
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
