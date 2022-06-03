import { compile, literal } from "../src"
import { spawnSync } from "child_process"
import { Expression } from "../src/Expression"

interface RegexEngine {
    name: string
    command: string
    extension: string
}

const PYTHON: RegexEngine = { name: "python", command: "python3", extension: "py" }
const ENGINES: [string, RegexEngine][] = [PYTHON].map(e => [e.name, e])

interface TestCase {
    pattern: Expression
    input: string
    matches: boolean
    //matchStart?: number
    //matchEnd?: number
    //groups?: any[]
}

const TEST_CASES: [string, TestCase][] = [
    { pattern: literal("hello"), input: "hello", matches: true },
].map(c => {
    return [c.pattern.toString(), c]
})

describe.each(ENGINES)("compiles correctly to %s regex", (_engineName, engine) => {
    test.each(TEST_CASES)("%s", async (_name, { pattern }) => {
        const regex = compile(pattern)

        const child = spawnSync(engine.command, [`run.${engine.extension}`], {
            cwd: `test/engines/${engine.name}`,
            input: regex,
        })
        console.log(child)
        console.log(child.stdout.toString())
    })
})
