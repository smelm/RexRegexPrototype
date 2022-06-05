import { compile, literal } from "../src"
import { spawnSync } from "child_process"
import { Expression } from "../src/Expression"

interface RegexEngine {
    name: string
    command: string
    extension: string
}

const PYTHON: RegexEngine = { name: "python", command: "python3", extension: "py" }
const PERL: RegexEngine = { name: "perl", command: "perl", extension: "pl" }

const ENGINES: [string, RegexEngine][] = [PYTHON, PERL].map(e => [e.name, e])

interface TestCase {
    pattern: Expression
    input: string
    matches: boolean
    //groups?: any[]
}

const TEST_CASES: [string, TestCase][] = [
    { pattern: literal("hello"), input: "hello", matches: true, matchStart: 0, matchEnd: 5 },
    { pattern: literal("hello"), input: "bye", matches: false },
].map(c => {
    return [c.pattern.toString(), c]
})

describe.each(ENGINES)("compiles correctly to %s regex", (_engineName, engine) => {
    test.each(TEST_CASES)("%s", async (_name, { pattern, input, ...expected }) => {
        const regex = compile(pattern)

        const matches = runProcess(
            engine.command,
            [`test/engines/${engine.name}/run.${engine.extension}`],
            regex,
            input
        )

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
