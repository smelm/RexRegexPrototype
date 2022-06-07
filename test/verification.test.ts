import { compile, literal } from "../src"
import { spawnSync } from "child_process"
import { Expression } from "../src/Expression"

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
    pattern: Expression
    input: string
    matches: boolean
    //groups?: any[]
}

let cases = literal("hello").generate(true, 42)
console.log(cases)

const TEST_CASES: [string, TestCase][] = [
    { pattern: literal("hello"), input: "hello", matches: true, matchStart: 0, matchEnd: 5 },
    { pattern: literal("hello"), input: "bye", matches: false },
].map(c => {
    return [`${c.pattern.toString()} ${c.matches ? "positive" : "negative"}`, c]
})

describe.each(ENGINES)("%s regex", (_engineName, engine) => {
    test.each(TEST_CASES)("%s", async (_name, { pattern, input, ...expected }) => {
        const regex = compile(pattern)

        const matches = engine.match(regex, input)

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
