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

        const { status, stdout } = spawnSync(engine.command, [`run.${engine.extension}`], {
            cwd: `test/engines/${engine.name}`,
            input: `${regex}SEP${input}`,
        })

        expect(status).toEqual(0)

        const matches = parseInt(stdout.toString().trim())

        expect(matches === 1).toEqual(expected.matches)
    })
})
