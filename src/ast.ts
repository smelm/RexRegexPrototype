import { AlternativeParser, SequenceParser, spaces as _ } from "./commonParsers"
import { Expression, expressionOrBlock } from "./Expression"
import { ExpressionSequenceParser } from "./ExpressionSequence"
import { InputExample } from "./Generator"
import { ANY, MANY, MAYBE, OF, TO } from "./keywords"
import { LiteralParser } from "./Literal"
import { number } from "./NumberParser"

export enum ExpressionType {
    ANY = "any",
    REPEAT = "repeat",
    MAYBE = "maybe",
    SEQUENCE = "sequence",
    CHARACTER = "character",
}

// TODO support "0 to many"
// TODO support "maybe many of", or not?
export class Repeat extends Expression {
    public static parser = new AlternativeParser([
        new SequenceParser([MANY, _, OF, expressionOrBlock]).builder(
            ([expr]: Expression[]) => new Repeat(expr, 1)
        ),
        new SequenceParser([number, _, OF, expressionOrBlock]).builder(
            ([number, expr]: any[]) => new Repeat(expr, number, number)
        ),
        new SequenceParser([
            number,
            _,
            TO,
            _,
            new AlternativeParser([number, MANY]),
            _,
            OF,
            expressionOrBlock,
        ]).builder(
            ([from, to, expr]: any[]) => new Repeat(expr, from, to === "many" ? undefined : to)
        ),
    ])

    constructor(value: Expression, public from: number, public to?: number) {
        super(ExpressionType.REPEAT, value)
    }

    toString(): string {
        return `${this.type}(${this.from}, ${this.to}, ${this.value.toString()})`
    }
}

export class Sequence extends Expression {
    public static parser = new ExpressionSequenceParser()

    constructor(value: Expression[]) {
        super(ExpressionType.SEQUENCE, value)
    }

    toString(): string {
        return `${this.type}(${this.value.map((v: Expression) => v.toString()).join(", ")})`
    }

    generate(valid: boolean, randomSeed: number): InputExample[] {
        return [
            {
                str: this.value
                    .map((v: Expression) => v.generate(valid, randomSeed)[0].str)
                    .join(""),
                description: "",
            },
        ]
    }
}

export class Character extends Expression {
    constructor(value: string) {
        super(ExpressionType.CHARACTER, value)
    }

    toString(): string {
        return `${this.type}(${this.value})`
    }

    generate(valid: boolean, randomSeed: number): InputExample[] {
        return [{ str: this.value, description: "" }]
    }
}

function charSeqFromLiteral(s: string): Sequence {
    const result = []
    for (let i = 0; i < s.length; i++) {
        const c = s.charAt(i)
        result.push(new Character(c))
    }
    return sequence(result)
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

    generate(valid: boolean, randomSeed: number): InputExample[] {
        const choice = Math.floor(Math.random() * 3)

        switch (choice) {
            case 0:
                return [{ str: "x", description: "" }]
            case 1:
                return [{ str: "y", description: "" }]
            case 2:
                return [{ str: "z", description: "" }]
            default:
                return [{ str: "X", description: "" }]
        }
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
