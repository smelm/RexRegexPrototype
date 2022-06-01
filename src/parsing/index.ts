import { newlines } from "./commonParsers"
import { Expression } from "./Expression"
import * as EXP from "../expression"
import { Repeat } from "./Repeat"
import { Sequence } from "./Sequence"

export function parse(input: string) {
    const result = new Sequence([
        new Expression(),
        new Repeat(
            new Sequence([newlines, new Expression()]).builder((exp: EXP.Expression[]) => exp[0])
        ),
    ])
        .builder(([head, tail]: [EXP.Expression, EXP.Expression[]]) =>
            EXP.sequence([head, ...tail])
        )
        .parse(input)

    if (result.value.length === 1) {
        return result.value[0]
    } else {
        return result.value
    }
}
