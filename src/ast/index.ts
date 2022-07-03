import { SequenceParser, spaces as _ } from "../commonParsers"
import { expressionOrBlock } from "../Expression"
import { ANY, MAYBE } from "../keywords"
import { LiteralParser } from "../Literal"
import { RandomGenerator } from "../RandomGenerator"
import { RandomSeed } from "random-seed"

import { Expression, ExpressionType } from "./Expression"
import { Sequence } from "./Sequence"
import { Repeat } from "./Repeat"
import { Character, randomCharacter } from "./Character"

export { Expression, ExpressionType } from "./Expression"
export { Sequence } from "./Sequence"
export { Repeat } from "./Repeat"
export { Character } from "./Character"

export function character(char: string): Character {
    return new Character(char)
}

function charSeqFromLiteral(s: string): Sequence {
    return sequence(s.split("").map(c => new Character(c)))
}

export class Literal extends Expression {
    public static parser = new LiteralParser().builder(charSeqFromLiteral)
}

export class Any extends Expression {
    public static parser = ANY.builder(() => new Any())

    constructor() {
        super(ExpressionType.ANY, "any")
    }

    toString(): string {
        return this.type.toString()
    }

    generateValid(rng: RandomSeed): string[] {
        return [randomCharacter(rng)]
    }

    generateInvalid(rng: RandomGenerator): string[] {
        //TODO: handle dotall mode here
        return []
    }
}

export function any(): Any {
    return new Any()
}

export function countOf(count: number, value: any): Repeat {
    return new Repeat(value, count, count)
}

export function countRangeOf(from: number, to: number, value: any): Repeat {
    return new Repeat(value, from, to)
}

export class Maybe extends Expression {
    public static parser = new SequenceParser([MAYBE, expressionOrBlock]).builder(
        ([expr]: Expression[]) => maybe(expr)
    )

    constructor(value: Expression) {
        super(ExpressionType.MAYBE, value)
    }

    generateValid(rng: RandomSeed): string[] {
        return [...this.value.generateValid(rng), ""]
    }

    generateInvalid(rng: RandomSeed): string[] {
        return this.value.generateInvalid(rng)
    }
}

export function maybe(value: any): Maybe {
    return new Maybe(value)
}

export function sequence(value: Expression[]): Sequence {
    return new Sequence(value)
}

export function manyOf(value: Expression): Repeat {
    return new Repeat(value, 1, undefined)
}

export function literal(value: string): Sequence {
    return charSeqFromLiteral(value)
}
