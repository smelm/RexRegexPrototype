import { StringParser, AlternativeParser, RepeatParser } from "./parsing"

export const space = new AlternativeParser([new StringParser(" "), new StringParser("\t")]).ignore()
export const spaces = new RepeatParser(space, false).ignore()
export const optionalSpaces = new RepeatParser(space, true).ignore()

export const newline = new AlternativeParser(
    ["\n", "\r", "\r\n"].map(s => new StringParser(s))
).ignore()
export const newlines = new RepeatParser(newline, false).ignore()
export const optionalNewlines = new RepeatParser(newline, true).ignore()
