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
CountRangeOf
export function ManyOf(value: any) {
    return { type: "many_of", value }
}

export function Maybe(value: any) {
    return { type: "maybe", value }
}

const actions = {
    any(_input: any, _start: any, _end: any, _elements: any) {
        return Any()
    },
    count_of(_input: any, _start: any, _end: any, elements: any) {
        return CountOf(parseInt(elements[0].text), elements[4])
    },
    count_range_of(_input: any, _start: any, _end: any, elements: any) {
        return CountRangeOf(parseInt(elements[0].text), parseInt(elements[4].text), elements[8])
    },
    many_of(_input: any, _start: any, _end: any, elements: any) {
        return ManyOf(elements[4])
    },
    maybe(_input: any, _start: any, _end: any, elements: any) {
        return Maybe(elements[2])
    },
}

export function parse(input: string) {
    return dsl.parse(input, { actions })
}
