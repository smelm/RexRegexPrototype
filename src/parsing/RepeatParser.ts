import { BaseParser, Parser } from "../Parser"
import { ok, err, ParseResult } from "../ParseResult"

export class RepeatParser extends BaseParser {
    constructor(private parser: Parser, private optional: boolean = false) {
        super()
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
