import * as dsl from "./dsl"

export function Any() {
    return {
        type: "any",
    }
}

export function CountOf(count: number, value: any) {
    return { type: "count_of", count, value }
}

export function CountRangeOf(from: number, to: number, value: any) {
    return { type: "count_of", from, to, value }
}

export function ManyOf(value: any) {
    return { type: "many_of", value }
}

export function Maybe(value: any) {
    return { type: "maybe", value }
}

export function Sequence(value: any) {
    return { type: "sequence", value }
}

const actions = {
    single_value(_input: any, _start: any, _end: any, elements: any) {
        return elements[0]
    },
    any(_input: any, _start: any, _end: any, _elements: any) {
        return Any()
    },
    count_of(_input: any, _start: any, _end: any, elements: any) {
        return CountOf(parseInt(elements[0].text), elements[1])
    },
    count_range_of(_input: any, _start: any, _end: any, elements: any) {
        return CountRangeOf(parseInt(elements[0].text), parseInt(elements[1].text), elements[2])
    },
    many_of(_input: any, _start: any, _end: any, elements: any) {
        return ManyOf(elements[0])
    },
    maybe(_input: any, _start: any, _end: any, elements: any) {
        return Maybe(elements[0])
    },
    sequence(_input: any, _start: any, _end: any, [element]: any): any {
        console.log(element)
        if ("head" in element && "tail" in element) {
            const tail = this.sequence(undefined, undefined, undefined, [element.tail])
            return Sequence([element.head, ...tail.value])
        } else {
            return Sequence([element])
        }
    },
}

export function parse(input: string) {
    return dsl.parse(input, { actions })
}
