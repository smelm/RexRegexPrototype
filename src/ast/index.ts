import { Expression } from "./Expression"
import { Sequence } from "./Sequence"
import { Repeat } from "./Repeat"
import { Character } from "./Character"
import { Any } from "./Any"
import { Maybe } from "./Maybe"
import { Group } from "./Group"

export { Expression, ExpressionType } from "./Expression"
export { Sequence } from "./Sequence"
export { Repeat } from "./Repeat"
export { Character } from "./Character"
export { Any } from "./Any"
export { Maybe } from "./Maybe"
export { Group } from "./Group"

export function character(char: string): Expression {
    return new Character(char)
}

export function any(): Expression {
    return new Any()
}

export function countOf(count: number, value: any): Expression {
    return new Repeat(value, count, count)
}

export function countRangeOf(from: number, to: number, value: any): Expression {
    return new Repeat(value, from, to)
}

export function maybe(value: any): Expression {
    return new Maybe(value)
}

export function sequence(value: Expression[]): Expression {
    return new Sequence(value)
}

export function manyOf(value: Expression): Expression {
    return new Repeat(value, 1, undefined)
}

export function literal(str: string): Expression {
    return sequence(str.split("").map(c => new Character(c)))
}

export function group(name: string, content: Expression): Expression {
    return new Group(name, content)
}
