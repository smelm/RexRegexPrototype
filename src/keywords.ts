import { StringParser } from "./parsing"

export const ANY = new StringParser("any").ignore()
export const MAYBE = new StringParser("maybe").ignore()
export const MANY = new StringParser("many").ignore()
export const OF = new StringParser("of").ignore()
export const TO = new StringParser("to").ignore()
export const END = new StringParser("end").ignore()
export const BEGIN = new StringParser("begin").ignore()
