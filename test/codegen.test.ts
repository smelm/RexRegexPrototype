import { any, countOf, countRangeOf, manyOf, maybe, sequence, compile } from "../src"

// TODO: string literals
const TEST_CASES = [
    [any(), "."],
    [countOf(5, any()), ".{5}"],
    [manyOf(any()), ".+"],
    [maybe(any()), ".?"],
    [countRangeOf(1, 5, any()), ".{1,5}"],
    [maybe(countOf(5, any())), ".{5}?"],
    [countRangeOf(0, undefined, any()), ".*"],
    // TODO sequence of one should be simplified
    [maybe(sequence([any()])), "(?:.)?"],
    [manyOf(sequence([any()])), "(?:.)+"],
    [countOf(3, sequence([any()])), "(?:.){3}"],
    [countRangeOf(3, 5, sequence([any()])), "(?:.){3,5}"],
    [maybe(sequence([any(), maybe(any())])), "(?:..?)?"],
    [manyOf(sequence([any(), maybe(any()), manyOf(any())])), "(?:..?.+)+"],
].map(([ast, regex]) => [ast.toString(), regex, ast])

describe.only("codegen", () => {
    test.each(TEST_CASES)("%s compiles to %s", (_testName, regex, ast) => {
        expect(compile(ast)).toEqual(regex)
    })
})
