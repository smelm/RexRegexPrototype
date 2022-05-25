import * as dsl from "./dsl"
import { any, countOf, countRangeOf, maybe, manyOf, sequence } from "./expression"

export * from "./expression"

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
