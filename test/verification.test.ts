import { any, character, compile, countOf, Expression, literal, maybe, sequence } from "../src"
import { spawnSync } from "child_process"
import { newRandomGenerator, generateRandomSeed } from "../src/RandomGenerator"

interface RegexEngine {
    name: string
    match: (regex: string, input: string) => boolean
}

const PYTHON: RegexEngine = {
    name: "python",
    match: (regex: string, input: string) =>
        runProcess("python3", ["test/engines/python/run.py"], regex, input),
}
const PERL: RegexEngine = {
    name: "perl",
    match: (regex: string, input: string) =>
        runProcess("perl", ["test/engines/perl/run.pl"], regex, input),
}

const NODEJS: RegexEngine = {
    name: "nodejs",
    match: (regex: string, input: string) => new RegExp(regex).test(input),
}

const ENGINES: [string, RegexEngine][] = [PYTHON, PERL, NODEJS].map(e => [e.name, e])

interface TestCase {
    ast: Expression
    pattern: string
    input: string
    matches: boolean
    //groups?: any[]
}

const randomSeed = generateRandomSeed()
const generator = newRandomGenerator(randomSeed)

function makeTestCases(): TestCase[] {
    const asts = [
        any(),
        literal("abc"),
        sequence([character("a"), any(), character("c")]),
        sequence([character("a"), maybe(character("b")), character("c")]),
        sequence([character("a"), countOf(3, character("b")), character("c")]),
    ]
    const cases = []

    for (let ast of asts) {
        for (let valid of [true, false]) {
            for (let str of ast.generate(valid, generator)) {
                cases.push({ input: str, pattern: compile(ast), matches: valid, ast })
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
    test.each(TEST_CASES)("%s", async (_name, { pattern, input, ...expected }) => {
        const matches = engine.match(pattern, input)

        expect(matches).toEqual(expected.matches)
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
