import {
    BaseParser,
    Parser,
    ok,
    ParseResult,
    AlternativeParser,
    RepeatParser,
    StringParser,
} from "."

export const space = new AlternativeParser([new StringParser(" "), new StringParser("\t")]).ignore()
export const spaces = new RepeatParser(space, false).ignore()

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
}
