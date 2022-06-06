import { AlternativeParser, SequenceParser, spaces as _ } from "./commonParsers"
import { Expression, expressionOrBlock } from "./Expression"
import { ExpressionSequenceParser } from "./ExpressionSequence"
import { ANY, MANY, MAYBE, OF, TO } from "./keywords"
import { LiteralParser } from "./Literal"
import { number } from "./NumberParser"

export enum ExpressionType {
    ANY = "any",
    REPEAT = "repeat",
    MAYBE = "maybe",
    SEQUENCE = "sequence",
    LITERAL = "literal",
}

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
}

export class Literal extends Expression {
    public static parser = new LiteralParser()

    constructor(value: string) {
        super(ExpressionType.LITERAL, value)
    }

    toString(): string {
        return `${this.type}(${this.value})`
    }
}

export function literal(value: string): Literal {
    return new Literal(value)
}

export class Any extends Expression {
    public static parser = ANY.builder(() => new Any())

    constructor() {
        super(ExpressionType.ANY, "any")
    }

    toString(): string {
        return this.type.toString()
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
