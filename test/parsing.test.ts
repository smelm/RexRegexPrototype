import {
    any,
    countOf,
    manyOf,
    maybe,
    countRangeOf,
    sequence,
    literal,
    Expression,
    group,
    alternative,
} from "../src/ast"
import { makeDSLParser, parse } from "../src"

const parser = makeDSLParser()

function generateTestNames([input, ast]) {
    return [ast.toString(), input, ast]
}

const SINGLE_LINE_CASES = [
    ["any", any()],
    ['"abc"', literal("abc")],
    ["5 of any", countOf(5, any())],
    ["many of any", manyOf(any())],
    ["maybe any", maybe(any())],
    ["1 to 5 of any", countRangeOf(1, 5, any())],
    ["maybe 5 of any", maybe(countOf(5, any()))],
    ["0 to many of any", countRangeOf(0, undefined, any())],
    ['either "a" or "b"', alternative(literal("a"), literal("b"))],
    ['either "a" or "b" or "c"', alternative(literal("a"), literal("b"), literal("c"))],
].map(generateTestNames)

describe("single line expressions", () => {
    test.each(SINGLE_LINE_CASES)("%s", (_testName: string, input: string, expected: Expression) => {
        const result = parser.tryParse(input)
        expect(result).toEqual(expected)
    })
})

const MULTI_LINE_CASES = [
    ['\n"abc"', literal("abc")],
    ['\n"abc"\n\n', literal("abc")],
    ['"abc"\n', literal("abc")],
    ['any\nmaybe "hello"\nmany of any', sequence([any(), maybe(literal("hello")), manyOf(any())])],
    ["maybe\nany\nend", maybe(any())],
    ["many of\nany\nend", manyOf(any())],
    ["3 of\nany\nend", countOf(3, any())],
    ["3 to 5 of\nany\nend", countRangeOf(3, 5, any())],
    ["maybe\nany\nmaybe any\nend", maybe(sequence([any(), maybe(any())]))],
    [
        "maybe\nany\nmaybe any\nmany of any\nend",
        maybe(sequence([any(), maybe(any()), manyOf(any())])),
    ],
    ['begin group_name\n"abc"\nend', group("group_name", literal("abc"))],
    ['either\n"a"\nor\n"b"\nend', alternative(literal("a"), literal("b"))],
    ['either\n"a"\nor\n"b"\nor\n"c"\nend', alternative(literal("a"), literal("b"), literal("c"))],
    ['define foo\n"bar"\nend\n"nothing"', literal("nothing")],
    ['define foo\n"foo"\nend\nfoo', literal("foo")],
    ['define foo "foo"\nfoo', literal("foo")], // online variable definition
].map(generateTestNames)

describe("multi line expressions", () => {
    test.each(MULTI_LINE_CASES)("%s", (_testName: string, input: string, expected: Expression) => {
        const result = parser.tryParse(input)
        expect(expected).toEqual(result)
    })
})

describe("multi line expressions with random white spaces", () => {
    test.each(MULTI_LINE_CASES)("%s", (_testName: string, input: string, expected: Expression) => {
        const randomWhitespace = () => " ".repeat(Math.random() * 4)
        input = input.replace("\n", `${randomWhitespace()}\n${randomWhitespace()}`)
        expect(parser.tryParse(input)).toEqual(expected)
    })
})

//TODO: the actual error messages do not reach the top of the parse tree
// because the DSL grammer is one big alternative and only one branch produces the correct error
// how to fix this?
// could .map(if problem throw new error) work?
describe("error handling", () => {
    test("undefined variable", () => {
        expect(() => parser.tryParse("foo")).toThrow()
    })

    test("redefinition of variable", () => {
        expect(() => parser.tryParse("define foo\nany\nend\ndefine foo\nany\nend"))
    })
})
