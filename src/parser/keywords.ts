import { string } from "parsimmon"

export const kw = Object.fromEntries(
    [
        "any",
        "maybe",
        "many",
        "of",
        "to",
        "end",
        "named",
        "either",
        "or",
        "define",
        "same",
        "as",
        "except",
        "not",
        "but",
        "begin",
    ].map(ident => [ident, string(ident).desc(ident)])
)

export function isKeyword(word: string): boolean {
    return Object.keys(kw).includes(word)
}
