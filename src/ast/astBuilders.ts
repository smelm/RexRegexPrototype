import { Expression } from "./Expression"
import { Sequence } from "./Sequence"
import { Repeat } from "./Repeat"
import { Character } from "./Character"
import { Any } from "./Any"
import { Group } from "./Group"
import { Alternative } from "./Alternative"
import { CharacterClass } from "./CharacterClass"
import { InvertedCharacterClass } from "./InvertedCharacterClass"
import { Backreference } from "./Backreference"
import { Letter } from "./Letter"
import { Language } from "./Language"
import { Digit } from "./Digit"

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

/**
 * if upper is undefined => open upper bound
 */
export function repeat(
    value: Expression,
    lower: number,
    upper?: number,
    lazy: boolean = false
): Expression {
    return new Repeat(value, lower, upper, lazy)
}

export function maybe(child: any): Expression {
    return new Repeat(child, 0, 1)
}

export function sequence(...children: Expression[]): Expression {
    return new Sequence(children)
}

export function manyOf(child: Expression): Expression {
    return new Repeat(child, 1, undefined)
}

export function literal(str: string): Expression {
    return sequence(...str.split("").map(c => new Character(c)))
}

export function group(name: string, child: Expression): Expression {
    return new Group(name, child)
}

export function backreference(groupName: string): Expression {
    return new Backreference(groupName)
}

export function alternative(...children: Expression[]): Expression {
    return new Alternative(children)
}

type RawRange = [string, string]
type Member = string | RawRange

function splitCharactersAndRanges(members: Member[]): [string[], RawRange[]] {
    return [
        members.filter(m => typeof m === "string") as string[],
        members.filter(m => typeof m !== "string") as [string, string][],
    ]
}

export function characterClass(...members: Member[]): Expression {
    const [characters, ranges] = splitCharactersAndRanges(members)

    return new CharacterClass(characters, ranges)
}

export function anyExcept(...members: Member[]): InvertedCharacterClass {
    const [characters, ranges] = splitCharactersAndRanges(members)
    return new InvertedCharacterClass(characters, ranges)
}

export function letter(language: Language = "EN"): Expression {
    return new Letter(language)
}

export function digit(): Expression {
    return new Digit()
}
