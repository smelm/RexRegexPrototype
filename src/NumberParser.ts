import { BaseParser, Parser } from "./Parser"
import { ParseResult } from "./ParseResult"
import { Repeat } from "./Repeat"
import { Alternative } from "./Alternative"
import { StringParser } from "./StringParser"
import { escapeNewlines } from "./utils"

export class NumberParser extends BaseParser {
    private parser = new Repeat(
        new Alternative("0123456789".split("").map(n => new StringParser(n)))
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
