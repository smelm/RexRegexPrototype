import { RexRegex } from "../src/index"

const script = RexRegex.importFromFile(`${__dirname}/../src/generated.json`)

console.log(script.toDSL())
