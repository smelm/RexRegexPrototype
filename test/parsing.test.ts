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
    anyOf,
    backreference,
    anyExcept,
    letter,
    digit,
    notBut,
} from "../src/ast"
import { CharacterClass } from "../src/ast/CharacterClass"
import { PositionInInput } from "../src/ast/DSLScript"
import { makeDSL } from "../src/parser"

const parser = makeDSL()

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
    ['any of "a", "b", "c"', anyOf("a", "b", "c")],
    ['any of "a" to "c", "x" to "z"', anyOf(["a", "c"], ["x", "z"])],
    ['any of "a", "b", "c", "x" to "z"', anyOf("a", "b", "c", ["x", "z"])],
    ["any of LETTER.EN, DIGIT", anyOf(letter("EN") as CharacterClass, digit() as CharacterClass)],
    ['any except of "a", "b", "c"', anyExcept("a", "b", "c")],
    ['any of "a" to "z" except of "a", "b", "c"', anyOf(["a", "z"]).exceptOf(["a", "c"])],
    ['"abc" # this is a comment', literal("abc")],
    ['not "b" but any of "a" to "d"', notBut(literal("b"), anyOf(["a", "d"]))],
].map(generateTestNames)

describe("single line expressions", () => {
    test.each(SINGLE_LINE_CASES)("%s", (_testName: string, input: string, expected: Expression) => {
        const result = parser.tryParse(input).child
        expect(result).toEqual(expected)
    })
})

const MULTI_LINE_CASES = [
    ['\n"abc"', literal("abc")],
    ['\n"abc"\n\n', literal("abc")],
    ['"abc"\n', literal("abc")],
    ['any\nmaybe "hello"\nmany of any', sequence(any(), maybe(literal("hello")), manyOf(any()))],
    ["maybe\nany\nend", maybe(any())],
    ["many of\nany\nend", manyOf(any())],
    ["3 of\nany\nend", countOf(3, any())],
    ["3 to 5 of\nany\nend", countRangeOf(3, 5, any())],
    ["maybe\nany\nmaybe any\nend", maybe(sequence(any(), maybe(any())))],
    [
        "maybe\nany\nmaybe any\nmany of any\nend",
        maybe(sequence(any(), maybe(any()), manyOf(any()))),
    ],
    ['named group_name\n"abc"\nend', group("group_name", literal("abc"))],
    ['either\n"a"\nor\n"b"\nend', alternative(literal("a"), literal("b"))],
    ['either\n"a"\nor\n"b"\nor\n"c"\nend', alternative(literal("a"), literal("b"), literal("c"))],
    ['define foo\n"bar"\nend\n"nothing"', literal("nothing")],
    ['define foo\n"foo"\nend\nfoo', literal("foo")],
    ['define foo "foo"\nfoo', literal("foo")], // one-line variable definition
    ['define foo.bar "word"\nfoo.bar', literal("word")],
    [
        'define one.two.this "first"\ndefine one.two.that "second"\none.two.that\none.two.this',
        sequence(literal("second"), literal("first")),
    ],
    ['any of\n"a", "b"\n"c"\nend', anyOf("a", "b", "c")],
    ['any of\n"a" to "c"\n"x" to "z"\nend', anyOf(["a", "c"], ["x", "z"])],
    ['any of\n"a"\n"b"\n"c"\n"x" to "z"\nend', anyOf("a", "b", "c", ["x", "z"])],
    ['any except of\n"a"\n"b"\n"c"\n"x" to "z"\nend', anyExcept("a", "b", "c", ["x", "z"])],
    ['any of \n"a" to "z"\nexcept of\n"a" to "c"\nend', anyOf(["a", "z"]).exceptOf(["a", "c"])],
    ['# this is a comment\n"abc"', literal("abc")],
    ['# this is a comment\n# this is another\n"abc"\n# and another', literal("abc")],
    [
        'named symbol\n"#"\nend\n\n"foo"\nsame as symbol',
        sequence(group("symbol", literal("#")), literal("foo"), backreference("symbol")),
    ],
    ['not\n"b"\nbut\nany of "a" to "d"\nend', notBut(literal("b"), anyOf(["a", "d"]))],
].map(generateTestNames)

describe("multi line expressions", () => {
    test.each(MULTI_LINE_CASES)("%s", (_testName: string, input: string, expected: Expression) => {
        const result = parser.tryParse(input).child

        expect(expected).toEqual(result)
    })
})

describe("multi line expressions with random white spaces", () => {
    test.each(MULTI_LINE_CASES)("%s", (_testName: string, input: string, expected: Expression) => {
        const randomWhitespace = () => " ".repeat(Math.random() * 4)
        input = input.replace("\n", `${randomWhitespace()}\n${randomWhitespace()}`)
        const result = parser.tryParse(input).child
        expect(result).toEqual(expected)
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

describe("settings", () => {
    test("beginning of input", () => {
        let { child, settings } = parser.tryParse("at beginning of input\n\nany")
        expect(child).toEqual(any())
        expect(settings.positionInInput).toEqual(PositionInInput.BEGINNING)
    })
})

describe("library", () => {
    test("simple library", () => {
        let dsl = makeDSL()
    })
})

describe("macros", () => {
    test("simple macro", () => {
        let dsl = makeDSL({
            myMacros: {
                pet: (isDogPerson: string) => {
                    if (isDogPerson === "true") {
                        return literal("dog")
                    } else {
                        return literal("cat")
                    }
                },
                wildAnimal: (animal: Expression) => animal,
            },
            otherAnimal: literal("elephant"),
        })

        let result = dsl.tryParse('myMacros.pet("true")').child
        expect(result).toEqual(literal("dog"))

        result = dsl.tryParse('myMacros.pet("false")').child
        expect(result).toEqual(literal("cat"))

        result = dsl.tryParse("myMacros.wildAnimal(otherAnimal)").child
        expect(result).toEqual(literal("elephant"))
    })
})
