import { Parser } from "./Parser"
import { ParseResult } from "./ParseResult"
import { Sequence } from "./Sequence"
import * as EXP from "../expression"
import { newlines, optionalSpaces } from "./commonParsers"
import { Repeat } from "./Repeat"
import { Expression } from "./Expression"

export class ExpressionSequence extends Parser {
    private parser = new Sequence([
        optionalSpaces,
        new Expression(),
        optionalSpaces,
        new Repeat(
            new Sequence([newlines, optionalSpaces, new Expression(), optionalSpaces]).builder(
                (exp: EXP.Expression[]) => exp[0]
            ),
            true
        ),
    ]).builder(([head, tail]: [EXP.Expression, EXP.Expression[]]) => {
        const seq = [head, ...tail]

        if (seq.length === 1) {
            return seq[0]
        } else {
            return EXP.sequence(seq)
        }
    })

    parse(input: string): ParseResult {
        const result = this.parser.parse(input)
        // console.log(result)
        return result
    }
}
