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
    characterClass,
    numberBetween,
} from "../src"
import { spawnSync } from "child_process"
import { newRandomGenerator, generateRandomSeed } from "../src/RandomGenerator"
import { ENGINES } from "./engines"

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
        [characterClass("a", "b", "c")],
        [characterClass(["x", "z"])],
        [characterClass("a", "b", ["x", "z"])],
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

function randIntWithLength(len: number): number {
    return Math.floor(Math.random() * Math.pow(10, len))
}

describe.each(ENGINES)("number ranges in %s", (_engineName, engine) => {
    let testCases = []
    const LENGTHS = [1, 2, 3, 4]
    for (const l1 of LENGTHS) {
        for (const l2 of LENGTHS) {
            let lower = randIntWithLength(l1)
            let upper = randIntWithLength(l2)

            if (lower > upper) {
                ;[lower, upper] = [upper, lower]
            }

            testCases.push([lower, upper])
        }
    }

    testCases = [[9, 16]]

    test.each(testCases)("%d < X < %d", (lower: number, upper: number) => {
        const pattern = "^(?:" + numberBetween(lower, upper).toRegex() + ")$"
        console.log(lower, upper, pattern)

        const diff = upper - lower
        const below = new Array(5).fill(undefined).map(() => Math.floor(Math.random() * lower))
        const between = new Array(5)
            .fill(undefined)
            .map(() => Math.ceil((diff - 1) * Math.random() + lower))

        const above = new Array(5)
            .fill(undefined)
            .map(() => Math.ceil(diff * Math.random() + upper))

        const outOfRangeNumbers = [...below, ...above]
        outOfRangeNumbers.forEach(x => {
            const result = engine.match(pattern, String(x))
            if (result.matches) {
                console.log("did not expect to match", x)
            }
            expect(result.matches).toEqual(false)
        })
        between.forEach(x => {
            const result = engine.match(pattern, String(x))
            if (!result.matches) {
                console.log("did expect to match", x)
            }
            expect(result.matches).toEqual(true)
        })
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
