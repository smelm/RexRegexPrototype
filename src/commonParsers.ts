import { BaseParser, Parser } from "./Parser"
import { ok, err, ParseResult } from "./ParseResult"
import { AlternativeParser } from "./parsing"
import { StringParser } from "./parsing/StringParser"
import { intersperse } from "./utils"

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

export const space = new AlternativeParser([new StringParser(" "), new StringParser("\t")]).ignore()
export const spaces = new RepeatParser(space, false).ignore()
export const optionalSpaces = new RepeatParser(space, true).ignore()

export const newline = new AlternativeParser(
    ["\n", "\r", "\r\n"].map(s => new StringParser(s))
).ignore()
export const newlines = new RepeatParser(newline, false).ignore()
export const optionalNewlines = new RepeatParser(newline, true).ignore()
