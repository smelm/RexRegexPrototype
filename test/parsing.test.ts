import { parse, any, countOf, manyOf, maybe, countRangeOf, sequence } from "../dist"

describe("single line expressions", () => {
    test.each([
        ["any", any()],
        ["5 of any", countOf(5, any())],
        ["many of any", manyOf(any())],
        ["maybe any", maybe(any())],
        ["1 to 5 of any", countRangeOf(1, 5, any())],
        ["maybe 5 of any", maybe(countOf(5, any()))],
        ["maybe many of any", maybe(manyOf(any()))],
    ])("%s", (input, expected) => {
        expect(parse(input)).toEqual(expected)
    })
})

describe("multi line line expressions", () => {
    test.each([
        ["maybe with block with one line", "maybe\nany\nend", maybe(sequence([any()]))],
        ["many of with block with one line", "many of\nany\nend", manyOf(sequence([any()]))],
        ["count with block with one line", "3 of\nany\nend", countOf(3, sequence([any()]))],
        [
            "count range with block with one line",
            "3 to 5 of\nany\nend",
            countRangeOf(3, 5, sequence([any()])),
        ],
        [
            "maybe with block with multiple line",
            "maybe\nany\nmaybe any\nend",
            maybe(sequence([any(), maybe(any())])),
        ],
        [
            "maybe with block with multiple line",
            "maybe\nany\nmaybe any\nmany of any\nend",
            maybe(sequence([any(), maybe(any()), manyOf(any())])),
        ],
    ])("%s", (_testName, input, expected) => {
        expect(parse(input)).toEqual(expected)
    })
})
