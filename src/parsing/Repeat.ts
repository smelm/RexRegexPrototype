import { Parser } from "./Parser"
import { err, ok, ParseResult } from "./ParseResult"

export class Repeat extends Parser {
    constructor(
        private parser: Parser,
        private optional: boolean = false,
        ignored: boolean = false
    ) {
        super(ignored)
    }

    parse(input: string): ParseResult {
        let values: any[] = []

        let result = this.parser.parse(input)

        while (result.isSuccess) {
            values.push(result.value)
            result = this.parser.parse(result.remaining)
        }

        if (!this.optional && values.length === 0) {
            return err(input, `expected at least one but ran into error: ${result.value}`)
        }

        return ok(values, input.slice(0, result.remaining.length), result.remaining)
    }
}