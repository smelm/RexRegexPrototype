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
import { spawnSync } from "child_process"
import { newRandomGenerator } from "../src/RandomGenerator"

interface MatchResult {
    matches: boolean
    groups?: Record<string, string>
}

interface RegexEngine {
    name: string
    match: (regex: string, input: string) => MatchResult
}

const NODEJS: RegexEngine = {
    name: "nodejs",
    match: (regex: string, input: string) => {
        const expr = new RegExp(regex)
        const result = expr.exec(input)

        return { matches: !!result, groups: result?.groups }
    },
}

const ENGINES: [string, RegexEngine][] = [/*PYTHON, PERL,*/ NODEJS].map(e => [e.name, e])

interface TestCase {
    ast: Expression
    pattern: string
    input: string
    matches: boolean
    groups?: Record<string, string>
}

const generator = newRandomGenerator("ifh8i9ze5lg")

function makeTestCases(): TestCase[] {
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
    const cases = []

    for (let [ast, groups] of asts) {
        ast = RexRegex.fromCode(ast as Expression)
        for (let matches of [true, false]) {
            let strs = matches
                ? ast.generateValid(ast, generator)
                : ast.generateInvalid(ast, generator)

            for (let str of strs) {
                cases.push({
                    input: str,
                    pattern: ast.toRegex(),
                    matches: matches,
                    ast,
                    groups: matches ? groups : undefined,
                })
            }
        }
    }

    return cases
}

const TEST_CASES: [string, TestCase][] = makeTestCases().map(c => {
    return [`${c.pattern} should${c.matches ? "" : "n't"} match ${c.input}`, c]
})

describe.each(ENGINES)("%s regex", (_engineName, engine) => {
    test.each(TEST_CASES)("%s", async (_name, { pattern, input, groups, matches }) => {
        const actual = engine.match(pattern, input)

        expect(actual.matches).toEqual(matches)
        expect(actual.groups).toEqual(groups)
    })
})

describe("special cases", () => {
    const expressionWithBackreference = sequence(
        group("symbol", anyOf("+", "#", "|")),
        literal("foo"),
        backreference("symbol")
    )

    test("matching backreference", () => {
        const pattern = expressionWithBackreference.toRegex()
        const result = NODEJS.match(pattern, "#foo#")
        expect(result.matches).toEqual(true)
    })

    test("not matching backreference", () => {
        const pattern = expressionWithBackreference.toRegex()
        const result = NODEJS.match(pattern, "#foo+")
        expect(result.matches).toEqual(false)
    })

    test("alternative matches longest possible", () => {
        const pattern = RexRegex.fromCode(alternative(literal("hell"), literal("hello"))).toRegex()
        const match = new RegExp(pattern).exec("hello")

        expect(match[0]).toEqual("hello")
    })
})

function runProcess(command: string, args: string[], regex: string, input: string): boolean {
    const { status, stdout } = spawnSync(command, args, {
        input: `${regex}SEP${input}`,
    })

    if (status !== 0) {
        throw new Error("process crashed")
    }

    return parseInt(stdout.toString().trim()) === 1
}
