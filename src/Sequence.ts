import { BaseParser, Parser } from "./Parser"
import { ok, ParseResult } from "./ParseResult"
import { intersperse } from "./utils"
import { spaces } from "./commonParsers"

export class SequenceParser extends BaseParser {
    constructor(private parsers: Parser[]) {
        super()
    }

    parse(input: string): ParseResult {
        let values: any[] = []
        let remaining = input
        for (const parser of this.parsers) {
            const result = parser.parse(remaining)

            if (!result.isSuccess) {
                return result // is the error
            }

            remaining = result.remaining

            if (!parser.ignored) {
                values.push(result.value)
            }
        }

        return ok(values, input, remaining)
    }

    public static tokens(...parsers: Parser[]): Parser {
        return new SequenceParser(intersperse(parsers, spaces))
    }
}
