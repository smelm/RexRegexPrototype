import { Repeat } from "./Repeat"
import { Alternative } from "./Alternative"
import { StringParser } from "./StringParser"

export const space = new Alternative([new StringParser(" "), new StringParser("\t")]).ignore()
export const spaces = new Repeat(space, false).ignore()
export const optionalSpaces = new Repeat(space, true).ignore()

export const newline = new Alternative(["\n", "\r", "\r\n"].map(s => new StringParser(s))).ignore()
export const newlines = new Repeat(newline, false).ignore()
export const optionalNewlines = new Repeat(newline, true).ignore()
