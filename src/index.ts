import * as dsl from "./dsl"

class Expression {
    constructor(public type: string) {}

    toString(): string {
        return this.type
    }
}

class NestedExpression extends Expression {
    constructor(type: string, public value: Expression) {
        super(type)
    }

    toString(): string {
        return `${this.type}(${this.value.toString()})`
    }
}

class CountOf extends NestedExpression {
    constructor(public count: number, value: Expression) {
        super("count_of", value)
    }

    toString(): string {
        return `${this.type}(${this.count}, ${this.value.toString()})`
    }
}

class CountRangeOf extends Expression {
    constructor(public from: number, public to: number, public value: Expression) {
        super("count_range_of")
    }

    toString(): string {
        return `${this.type}(${this.from}, ${this.to}, ${this.value.toString()})`
    }
}

class Sequence extends Expression {
    constructor(public value: Expression[]) {
        super("sequence")
    }

    toString(): string {
        return `${this.type}(${this.value.map(v => v.toString()).join(", ")})`
    }
}

export function any() {
    return new Expression("any")
}

export function countOf(count: number, value: any) {
    return new CountOf(count, value)
}

export function countRangeOf(from: number, to: number, value: any) {
    return new CountRangeOf(from, to, value)
}

export function manyOf(value: Expression) {
    return new NestedExpression("many_of", value)
}

export function maybe(value: any) {
    return new NestedExpression("maybe", value)
}

export function sequence(value: Expression[]) {
    return new Sequence(value)
}

const actions = {
    single_value(_input: any, _start: any, _end: any, elements: any) {
        return elements[0]
    },
    any(_input: any, _start: any, _end: any, _elements: any) {
        return any()
    },
    count_of(_input: any, _start: any, _end: any, elements: any) {
        return countOf(parseInt(elements[0].text), elements[1])
    },
    count_range_of(_input: any, _start: any, _end: any, elements: any) {
        return countRangeOf(parseInt(elements[0].text), parseInt(elements[1].text), elements[2])
    },
    many_of(_input: any, _start: any, _end: any, elements: any) {
        return manyOf(elements[0])
    },
    maybe(_input: any, _start: any, _end: any, elements: any) {
        return maybe(elements[0])
    },
    sequence(_input: any, _start: any, _end: any, [element]: any): any {
        if ("head" in element && "tail" in element) {
            const tail = this.sequence(undefined, undefined, undefined, [element.tail])
            return sequence([element.head, ...tail.value])
        } else {
            return sequence([element])
        }
    },
}

export function parse(input: string) {
    return dsl.parse(input, { actions })
}
