import { SequenceParser, spaces as _ } from "./commonParsers"
import { Expression, expressionOrBlock } from "./Expression"
import { ExpressionSequenceParser } from "./ExpressionSequence"
import { ExpressionType } from "./ExpressionType"
import { ANY, MANY, MAYBE, OF, TO } from "./keywords"
import { LiteralParser } from "./Literal"
import { number } from "./NumberParser"

export { ExpressionType } from "./ExpressionType"

export class CountOf extends Expression {
    public static parser = new SequenceParser([number, _, OF, expressionOrBlock]).builder(
        (value: any[]) => countOf(value[0], value[1])
    )

    constructor(public count: number, value: Expression) {
        super(ExpressionType.COUNT_OF, value)
    }

    toString(): string {
        return `${this.type}(${this.count}, ${this.value.toString()})`
    }
}

export class CountRangeOf extends Expression {
    public static parser = new SequenceParser([
        number,
        _,
        TO,
        _,
        number,
        _,
        OF,
        expressionOrBlock,
    ]).builder((value: any[]) => countRangeOf(value[0], value[1], value[2]))

    constructor(public from: number, public to: number, value: Expression) {
        super(ExpressionType.COUNT_RANGE, value)
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

export function countOf(count: number, value: any): CountOf {
    return new CountOf(count, value)
}

export function countRangeOf(from: number, to: number, value: any): CountRangeOf {
    return new CountRangeOf(from, to, value)
}

export class ManyOf extends Expression {
    public static parser = new SequenceParser([MANY, _, OF, expressionOrBlock]).builder(
        (value: Expression[]) => manyOf(value[0])
    )

    constructor(value: Expression) {
        super(ExpressionType.MANY, value)
    }
}

export class Maybe extends Expression {
    public static parser = new SequenceParser([MAYBE, expressionOrBlock]).builder(
        ([expr]: Expression[]) => maybe(expr)
    )

    constructor(value: Expression) {
        super(ExpressionType.MAYBE, value)
    }
}

export function manyOf(value: Expression): ManyOf {
    return new ManyOf(value)
}

export function maybe(value: any): Maybe {
    return new Maybe(value)
}

export function sequence(value: Expression[]): Sequence {
    return new Sequence(value)
}
