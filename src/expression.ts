export enum ExpressionType {
    ANY = "any",
    COUNT_OF = "count_of",
    COUNT_RANGE = "count_range",
    MAYBE = "maybe",
    MANY = "many",
    SEQUENCE = "sequence",
}

export class Expression {
    constructor(public type: ExpressionType) {}

    toString(): string {
        return this.type.toString()
    }
}

export class NestedExpression extends Expression {
    constructor(type: ExpressionType, public value: Expression) {
        super(type)
    }

    toString(): string {
        return `${this.type}(${this.value.toString()})`
    }
}

export class CountOf extends NestedExpression {
    constructor(public count: number, value: Expression) {
        super(ExpressionType.COUNT_OF, value)
    }

    toString(): string {
        return `${this.type}(${this.count}, ${this.value.toString()})`
    }
}

export class CountRangeOf extends Expression {
    constructor(public from: number, public to: number, public value: Expression) {
        super(ExpressionType.COUNT_RANGE)
    }

    toString(): string {
        return `${this.type}(${this.from}, ${this.to}, ${this.value.toString()})`
    }
}

export class Sequence extends Expression {
    constructor(public value: Expression[]) {
        super(ExpressionType.SEQUENCE)
    }

    toString(): string {
        return `${this.type}(${this.value.map(v => v.toString()).join(", ")})`
    }
}

export function any() {
    return new Expression(ExpressionType.ANY)
}

export function countOf(count: number, value: any) {
    return new CountOf(count, value)
}

export function countRangeOf(from: number, to: number, value: any) {
    return new CountRangeOf(from, to, value)
}

export function manyOf(value: Expression) {
    return new NestedExpression(ExpressionType.MANY, value)
}

export function maybe(value: any) {
    return new NestedExpression(ExpressionType.MAYBE, value)
}

export function sequence(value: Expression[]) {
    return new Sequence(value)
}