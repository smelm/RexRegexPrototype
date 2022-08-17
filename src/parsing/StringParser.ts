import { BaseParser, err, ok, ParseResult } from "."
import { escapeNewlines } from "./utils"

export class StringParser extends BaseParser {
    constructor(private str: string, private value?: any) {
        super()

        if (!this.value) {
            this.value = str
        }
    }

    parse(input: string): ParseResult {
        if (input.startsWith(this.str)) {
            return ok(this.value, this.str, input.slice(this.str.length))
        } else {
            return err(input, `expected '${this.str}' but got '${escapeNewlines(input)}'`)
        }
    }
}
