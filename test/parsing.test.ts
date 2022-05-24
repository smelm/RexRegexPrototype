import { parse, Any, CountOf, ManyOf, Maybe, CountRangeOf, Sequence } from "../dist"

describe("single line expressions", () => {
    test.each([
        ["any", Any()],
        ["5 of any", CountOf(5, Any())],
        ["many of any", ManyOf(Any())],
        ["maybe any", Maybe(Any())],
        ["1 to 5 of any", CountRangeOf(1, 5, Any())],
        ["maybe 5 of any", Maybe(CountOf(5, Any()))],
        ["maybe many of any", Maybe(ManyOf(Any()))],
    ])("%s", (input, expected) => {
        console.log(parse(input))
        expect(parse(input)).toEqual(expected)
    })
})

describe("multi line line expressions", () => {
    test.each([
        ["maybe with block with one line", "maybe\nany\nend", Maybe(Sequence(Any()))],
        ["many of with block with one line", "many of\nany\nend", ManyOf(Sequence(Any()))],
        ["count with block with one line", "3 of\nany\nend", CountOf(3, Sequence(Any()))],
        [
            "count range with block with one line",
            "3 to 5 of\nany\nend",
            CountRangeOf(3, 5, Sequence(Any())),
        ],
    ])("%s", (_testName, input, expected) => {
        expect(parse(input)).toEqual(expected)
    })
})
