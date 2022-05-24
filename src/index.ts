import * as dsl from "./dsl"

export function Any() {
    return {
        type: "any",
    }
}

export function CountOf(count: number, value: any) {
    return { type: "count_of", count, value }
}

export function ManyOf(value: any) {
    return { type: "many_of", value }
}

const actions = {
    any(input: any, start: any, end: any, elements: any) {
        return Any()
    },
    count_of(input: any, start: any, end: any, elements: any) {
        return CountOf(parseInt(elements[0].text), elements[4])
    },
    many_of(input: any, start: any, end: any, elements: any) {
        console.log(elements)
        return ManyOf(elements[4])
    },
}

export function parse(input: string) {
    return dsl.parse(input, { actions })
}
