import { BaseParser } from "./Parser"
import { ParseResult } from "./ParseResult"
import { AlternativeParser, Repeat, StringParser } from "./commonParsers"
import { escapeNewlines } from "./utils"

export class NumberParser extends BaseParser {
    private parser = new Repeat(
        new AlternativeParser("0123456789".split("").map(n => new StringParser(n)))
    ).builder(parseInt)

    parse(input: string): ParseResult {
        const result = this.parser.parse(input)
        if (!result.isSuccess) {
            result.value = `expected a number but got ${escapeNewlines(input)}`
        }
        return result
    }
}

export const number = new NumberParser()
