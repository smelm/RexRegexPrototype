import { Parser } from "./Parser"
import { err, ok, ParseResult } from "./ParseResult"
import { escapeNewlines } from "./utils"
import * as AST from "./ast"

// TODO: does the dsl need quote escaping?
/* ab"c can also be done via
 *  "ab"
 *  QUOTE
 *  c
 */
export class LiteralParser extends Parser {
    parse(input: string): ParseResult {
        if (input[0] !== '"') {
            return err(
                input,
                `expected string literal to start with " but got ${escapeNewlines(input)}`
            )
        }

        const closingQuote = input.indexOf('"', 1)

        if (closingQuote === -1) {
            return err(input, `not closed string literal, ${escapeNewlines(input)}`)
        }

        const content = input.slice(1, closingQuote)
        const remaining = input.slice(closingQuote + 1)

        // include both quotes
        const matched = input.slice(0, closingQuote + 1)

        const result = ok(AST.literal(content), matched, remaining)
        return result
    }
}
