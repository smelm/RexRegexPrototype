import { StringParser, AlternativeParser, RepeatParser } from "./parsing"

export const singleSpace = new AlternativeParser([
    new StringParser(" "),
    new StringParser("\t"),
]).ignore()
export const spaces = new RepeatParser(singleSpace, false).ignore()
export const optionalSpaces = new RepeatParser(singleSpace, true).ignore()

export const singleNewline = new AlternativeParser(
    ["\n", "\r", "\r\n"].map(s => new StringParser(s))
).ignore()
export const newlines = new RepeatParser(singleNewline, false).ignore()
export const optionalNewlines = new RepeatParser(singleNewline, true).ignore()
