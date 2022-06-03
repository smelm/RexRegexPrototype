import { BaseParser, Parser } from "./Parser"
import { err, ParseResult } from "./ParseResult"

export class Alternative extends BaseParser {
    constructor(private parsers: Parser[]) {
        super()
    }

    parse(input: string): ParseResult {
        const errors: string[] = []
        for (const p of this.parsers) {
            const result = p.parse(input)

            if (result.isSuccess) {
                return result
            }

            errors.push(result.value)
        }
        return err(input, `no alternative matched: \n${errors.map(err => "    " + err).join("\n")}`)
    }
}
