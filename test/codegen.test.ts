import {
    any,
    character,
    countOf,
    countRangeOf,
    Expression,
    group,
    literal,
    manyOf,
    maybe,
    sequence,
    alternative,
    anyOf,
    backreference,
    RexRegex,
    notBut,
    anyExcept,
} from "../src"
import { newRandomGenerator } from "../src/RandomGenerator"
import { JavaEngine, NodeJSEngine, PythonEngine, RegexEngine } from "../src/engines"

const ENGINES: [string, RegexEngine][] = [
    new NodeJSEngine(),
    new PythonEngine(),
    new JavaEngine(),
].map(e => [e.type, e])

interface TestCase {
    ast: Expression
    input: string
    matches: boolean
    groups?: Record<string, string>
    pattern: string
}

const generator = newRandomGenerator()

const asts = [
    [any()],
    [literal("abc")],
    [literal("\\w")],
    [literal(".")],
    [literal("[")],
    [literal("]")],
    [literal("]")],
    [literal("(")],
    [literal(")")],
    [literal("{")],
    [literal("}")],
    [literal("+")],
    [literal("*")],
    [literal("?")],
    [sequence(character("a"), any(), character("c"))],
    [sequence(character("a"), maybe(character("b")), character("c"))],
    [sequence(character("a"), countOf(3, character("b")), character("c"))],
    [sequence(character("a"), countRangeOf(3, 5, character("b")), character("c"))],
    [sequence(character("a"), countRangeOf(0, 3, character("b")), character("c"))],
    [sequence(character("a"), manyOf(character("b")), character("c"))],
    [group("foo", sequence(literal("abc"))), { foo: "abc" }],
    [alternative(literal("foo"), literal("bar"))],
    [sequence(literal("a"), alternative(literal("b"), literal("c")))],
    [anyOf("a", "b", "c")],
    [anyOf(["x", "z"])],
    [anyOf("a", "b", ["x", "z"])],
    [anyOf("[", "]")],
    [anyOf("-", "\\")],
    [anyOf("^")],
    [anyOf(["a", "f"]).exceptOf("e")],
    [anyExcept(["a", "b"])],
    [notBut(literal("a"), anyOf(["a", "c"]))],
]

function makeTestCases(engine: RegexEngine): TestCase[] {
    const cases = []

    for (let [ast, groups] of asts) {
        ast = RexRegex.fromCode(ast as Expression)
        for (let matches of [true, false]) {
            let strs = matches
                ? ast.positiveTestCases(ast, generator)
                : ast.negativeTestCases(ast, generator)

            for (let str of strs) {
                cases.push({
                    input: str,
                    matches: matches,
                    ast,
                    groups: matches ? groups : undefined,
                    pattern: ast.toRegex(engine),
                })
            }
        }
    }

    return cases
}

describe.each(ENGINES)("%s regex", (_engineName, engine) => {
    const TEST_CASES: [string, TestCase][] = makeTestCases(engine).map(c => {
        return [`${c.pattern} should${c.matches ? "" : "n't"} match ${c.input}`, c]
    })

    test.each(TEST_CASES)("%s", async (_name, { pattern, input, groups, matches }) => {
        const actual = engine.match(pattern, input)

        expect(actual.matches).toEqual(matches)
        expect(actual.groups).toEqual(groups)
    })
})

describe.each(ENGINES)("%s special cases", (_engineName, engine) => {
    const expressionWithBackreference = sequence(
        group("symbol", anyOf("+", "#", "|")),
        literal("foo"),
        backreference("symbol")
    )

    test("matching backreference", () => {
        const pattern = expressionWithBackreference.toRegex(engine)
        const result = engine.match(pattern, "#foo#")
        expect(result.matches).toEqual(true)
    })

    test("not matching backreference", () => {
        const pattern = expressionWithBackreference.toRegex(engine)
        const result = engine.match(pattern, "#foo+")
        expect(result.matches).toEqual(false)
    })

    test("alternative matches longest possible", () => {
        const pattern = RexRegex.fromCode(alternative(literal("hell"), literal("hello"))).toRegex(
            engine
        )
        const match = new RegExp(pattern).exec("hello")

        expect(match[0]).toEqual("hello")
    })
})
