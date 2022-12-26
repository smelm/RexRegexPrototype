import { makeDSL } from "../src/parser"
import { separatedBy, SeparatedByParser } from "../src/libraries"
import { SeparatedBy } from "../src/libraries"
import { literal } from "../src/ast"

describe("library", () => {
    test("seperated by", () => {
        let dsl = makeDSL({}, [new SeparatedByParser()])
        let result = dsl.tryParse('. separating "a"').child
        let expected = separatedBy(literal("a"), ".")
        console.log("expected", expected)
        console.log("result", result)
        expect(result).toEqual(expected)
    })
})
