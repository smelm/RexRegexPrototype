import { alt, Parser, string, whitespace as _ } from "parsimmon"
import { PositionInInput, ScriptSettings } from "../ast/DSLScript"

export const preamble: Parser<ScriptSettings> = alt(
    string("at beginning of input").map(() => PositionInInput.BEGINNING),
    string("at end of input").map(() => PositionInInput.END),
    string("somewhere in input").map(() => PositionInInput.WITHIN)
).map(position => new ScriptSettings(position))
