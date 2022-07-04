import { AlternativeParser, RepeatParser, StringParser } from "."

export const singleSpace = new AlternativeParser([
    new StringParser(" "),
    new StringParser("\t"),
]).ignore()
export const spaces = new RepeatParser(singleSpace, false).ignore()
export const optionalSpaces = new RepeatParser(singleSpace, true).ignore()
