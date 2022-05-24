import { parse, Any, CountOf, ManyOf } from "../dist"

describe("", () => {
    test.each([
        ["any", Any()],
        ["5 of any", CountOf(5, Any())],
        ["many of any", ManyOf(Any())],
    ])("%s", (input, expected) => {
        expect(parse(input)).toEqual(expected)
    })

    //"maybe any"
    //"maybe many of any"
    //"5 of any"
})
