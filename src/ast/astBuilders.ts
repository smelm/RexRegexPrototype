import { Expression } from "./Expression"
import { Sequence } from "./Sequence"
import { Repeat } from "./Repeat"
import { Character } from "./Character"
import { Any } from "./Any"
import { Maybe } from "./Maybe"
import { Group } from "./Group"
import { Alternative } from "./Alternative"
import { CharacterClass } from "./CharacterClass"
import { zip } from "../utils"

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
export function repeat(value: Expression, lower: number, upper?: number): Expression {
    return new Repeat(value, lower, upper)
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

export function alternative(...alternatives: Expression[]): Expression {
    return new Alternative(alternatives)
}

export function characterClass(...members: (string | [string, string])[]): Expression {
    const characters = members.filter(m => typeof m === "string") as string[]
    const ranges = members.filter(m => typeof m !== "string") as [string, string][]

    return new CharacterClass(characters, ranges)
}

export function numberBetween(
    lower: number,
    upper: number,
    { leadingZeroes = false }: { leadingZeroes?: boolean } = {}
): Expression {
    if (lower > upper) {
        throw new Error(`lower ${lower} is bigger than upper ${upper}`)
    }

    let upperDigits = String(upper)
        .split("")
        .map(d => Number.parseInt(d))
    let lowerDigits = String(lower)
        .split("")
        .map(d => Number.parseInt(d))
    // padding
    lowerDigits = [...new Array(upperDigits.length - lowerDigits.length).fill(0), ...lowerDigits]

    let lowerPrefix = ""
    let upperPrefix = ""
    const alternatives = []

    for (let [l, u] of zip(lowerDigits, upperDigits)) {
        const paddingLength = upperDigits.length - upperPrefix.length - 1
        const padding =
            paddingLength > 0
                ? [repeat(characterClass(["0", "9"]), paddingLength, paddingLength)]
                : []

        if (lowerPrefix === upperPrefix) {
            if (u - l >= 2) {
                alternatives.push(
                    sequence([
                        ...(upperPrefix.length > 0 ? [literal(upperPrefix)] : []),
                        characterClass([(l + 1).toString(), (u - 1).toString()]),
                        ...padding,
                    ])
                )
            }
        } else {
            // lower
            if (l < 9) {
                alternatives.push(
                    sequence([
                        literal(lowerPrefix),
                        characterClass([(l + 1).toString(), "9"]),
                        ...padding,
                    ])
                )
            }

            // upper
            if (u > 0) {
                alternatives.push(
                    sequence([
                        literal(upperPrefix),
                        characterClass(["0", (u - 1).toString()]),
                        ...padding,
                    ])
                )
            }
        }

        if (l !== 0 || leadingZeroes) {
            lowerPrefix += l.toString()
        }
        upperPrefix += u.toString()
    }
    return alternative(...alternatives)
}
