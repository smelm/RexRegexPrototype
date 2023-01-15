import { literal, RexRegex, sequence } from "../src"
import { numberBetween } from "../src/lib"
import { readFileSync } from "fs"
import { newRandomGenerator } from "../src/RandomGenerator"

function timestamp() {
    return sequence(
        numberBetween(0, 2100, { leadingZeroes: true }),
        literal("-"),
        numberBetween(1, 12, { leadingZeroes: true }),
        literal("-"),
        numberBetween(0, 31, { leadingZeroes: true }),
        literal(" "),
        numberBetween(0, 24, { leadingZeroes: true }),
        literal(":"),
        numberBetween(0, 59, { leadingZeroes: true }),
        literal(":"),
        numberBetween(0, 59, { leadingZeroes: true })
    )
}

const dslScript: string = readFileSync(`${__dirname}/logline.rexregex`).toString()
const pattern = RexRegex.fromString(dslScript, { timestamp })

console.log(
    JSON.stringify(
        {
            positive: pattern.generateValid(pattern, newRandomGenerator()),
            negative: pattern.generateInvalid(pattern, newRandomGenerator()),
        },
        undefined,
        4
    )
)
