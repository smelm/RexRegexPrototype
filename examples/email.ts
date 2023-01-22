import { RexRegex } from "../src"
import { readFileSync } from "fs"
import { NodeJSEngine } from "../src/engines"
import shuffle from "shuffle-array"

function banner(title: string) {
    console.log()
    console.log("########################################")
    console.log(title)
    console.log("########################################")
    console.log()
}

const valid = [
    "email@example.com",
    "firstname.lastname@example.com",
    "email@subdomain.example.com",
    "firstname+lastname@example.com",
    //"email@123.123.123.123",
    "email@[123.123.123.123]",
    '"email"@example.com',
    "1234567890@example.com",
    "email@example-one.com",
    "_______@example.com",
    "email@example.name",
    "email@example.museum",
    "email@example.co.jp",
    "firstname-lastname@example.com",
    //"much.”more unusual”@example.com",
    //"very.unusual.”@”.unusual.com@example.com",
    //'very.”(),:;<>[]”.VERY.”very@\\ "very”.unusual@strange.example.com',
]

const invalid = [
    "plainaddress",
    "#@%^%#$@#$@#.com",
    "@example.com",
    "Joe Smith <email@example.com>",
    "email.example.com",
    "email@example@example.com",
    ".email@example.com",
    "email.@example.com",
    "email..email@example.com",
    //"あいうえお@example.com",
    "email@example.com (Joe Smith)",
    "email@example",
    //"email@-example.com",
    //"email@example.web",
    "email@111.222.333.44444",
    "email@example..com",
    "Abc..123@example.com",
    "”(),:;<>[]@example.com",
    //"just”not”right@example.com",
    'this is"really"notallowed@example.com',
]

const dslString: string = readFileSync(`${__dirname}/email.rexregex`).toString()
const dslScript = RexRegex.fromString(dslString)
const dslRegex = new RegExp(dslScript.toRegex(new NodeJSEngine()))
const originalPattern =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

banner("DSL")

console.log(dslString)

banner("Regex")

console.log("original regex")
console.log(originalPattern.toString().slice(1, originalPattern.toString().length - 1))

console.log()

console.log("compiled regex")
console.log(dslRegex.toString().slice(1, dslRegex.toString().length - 1))

const fail = "\x1b[31m✗\x1b[0m"
const success = "\x1b[32m✓\x1b[0m"

banner("Valid email addresses")

for (const sample of valid) {
    console.log(sample, dslRegex.test(sample) === originalPattern.test(sample) ? success : fail)
}

banner("Invalid email addresses")

for (const sample of valid) {
    console.log(sample, dslRegex.test(sample) === originalPattern.test(sample) ? success : fail)
}

const { positive, negative } = dslScript.testCases()

shuffle(positive)
shuffle(negative)

banner("Test Samples")

console.log(
    positive
        .slice(0, 10)
        .map(s => `${success} ${s}`)
        .join("\n")
)
console.log(
    negative
        .slice(0, 10)
        .map(s => `${fail} ${s}`)
        .join("\n")
)
