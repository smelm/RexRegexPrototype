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
} from "../src"
import { spawnSync } from "child_process"
import { newRandomGenerator, generateRandomSeed } from "../src/RandomGenerator"

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

const randomSeed = generateRandomSeed()
const generator = newRandomGenerator(randomSeed)

function makeTestCases(): TestCase[] {
    const asts = [
        [any()],
        [literal("abc")],
        [sequence([character("a"), any(), character("c")])],
        [sequence([character("a"), maybe(character("b")), character("c")])],
        [sequence([character("a"), countOf(3, character("b")), character("c")])],
        [sequence([character("a"), countRangeOf(3, 5, character("b")), character("c")])],
        [sequence([character("a"), countRangeOf(0, 3, character("b")), character("c")])],
        [sequence([character("a"), manyOf(character("b")), character("c")])],
        [group("foo", sequence([literal("abc")])), { foo: "abc" }],
        [alternative(literal("foo"), literal("bar"))],
        [alternative(literal("foo"), any())],
    ]
    const cases = []

    for (let [ast, groups] of asts) {
        ast = ast as Expression
        for (let matches of [true, false]) {
            let strs = matches ? ast.generateValid(generator) : ast.generateInvalid(generator)

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

beforeAll(() => console.log("random seed", randomSeed))

describe.each(ENGINES)("%s regex", (_engineName, engine) => {
    test.each(TEST_CASES)("%s", async (_name, { pattern, input, groups, matches }) => {
        const actual = engine.match(pattern, input)

        expect(actual.matches).toEqual(matches)
        expect(actual.groups).toEqual(groups)
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
