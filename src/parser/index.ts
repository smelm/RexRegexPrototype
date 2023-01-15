import { Parser, whitespace as _ } from "parsimmon"
import * as builders from "../ast/astBuilders"
import { DSLScript } from "../ast/DSLScript"
import { stdLib } from "../lib"

import { makeDSLParser } from "./parser"
export { makeDSLParser } from "./parser"

export function makeDSL(variables: any = {}): Parser<DSLScript> {
    const CONSTANTS = {
        DOUBLE_QUOTE: builders.literal('"'),
        SPACE: builders.whitespace(),
        DIGIT: builders.digit(),
        LETTER: {
            EN: builders.letter("EN"),
            DE: builders.letter("DE"),
        },
    }

    return makeDSLParser({ ...CONSTANTS, ...stdLib, ...variables })
}
