import { Parser } from "./Parser"
import { err, ParseResult } from "./ParseResult"

export class Alternative extends Parser {
    constructor(private parsers: Parser[], ignored: boolean = false) {
        super(ignored)
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
