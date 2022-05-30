import { Repeat } from "./Repeat"
import { Alternative } from "./Alternative"
import { StringParser } from "./StringParser"

export const space = new Alternative([new StringParser(" "), new StringParser("\t")])
export const spaces = new Repeat(space, false, true)
export const optionalSpaces = new Repeat(space, true, true)

export const newline = new Alternative(["\n", "\r", "\r\n"].map(s => new StringParser(s)))
export const newlines = new Repeat(newline, false, true)
export const optionalNewlines = new Repeat(newline, true, true)
