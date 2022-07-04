import { AlternativeParser, RepeatParser, StringParser } from "."

export const singleNewline = new AlternativeParser(
    ["\n", "\r", "\r\n"].map(s => new StringParser(s))
).ignore()
export const newlines = new RepeatParser(singleNewline, false).ignore()
export const optionalNewlines = new RepeatParser(singleNewline, true).ignore()
