import { RexRegex } from "../src"

const DEFAULT_FILE = `${__dirname}/../src/generated.json`

let input

if (process.argv.length > 2) {
    input = process.argv[2]
    console.log("reading script from", input)
} else {
    input = DEFAULT_FILE
    console.log("reading script from default file", input)
}

const script = RexRegex.importFromFile(input)

console.log("----------------------------------------")
console.log(script.toDSL())
