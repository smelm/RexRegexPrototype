import { BaseParser, ParseResult, err, ok } from "."

export class IdentifierParser extends BaseParser {
    parse(input: string): ParseResult {
        const match = /\w+/.exec(input)

        if (!match || match.index != 0) {
            return err(input, `expected start of identifier but got ${input.slice(0, 3)}`)
        }

        const matched = match[0]
        const remaining = input.slice(matched.length)

        return ok(matched, matched, remaining)
    }
}
