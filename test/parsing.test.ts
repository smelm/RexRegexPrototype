import { parse, Any, CountOf, ManyOf, Maybe, CountRangeOf } from "../dist"

describe("", () => {
    test.each([
        ["any", Any()],
        ["5 of any", CountOf(5, Any())],
        ["many of any", ManyOf(Any())],
        ["maybe any", Maybe(Any())],
        ["1 to 5 of any", CountRangeOf(1, 5, Any())],
        ["maybe 5 of any", Maybe(CountOf(5, Any()))],
        ["maybe many of any", Maybe(ManyOf(Any()))],
    ])("%s", (input, expected) => {
        expect(parse(input)).toEqual(expected)
    })
})
