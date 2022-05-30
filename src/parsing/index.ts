import { Expression } from "./Expression"
import { Repeat } from "./Repeat"

export function parse(input: string) {
    const result = new Repeat(new Expression()).parse(input)

    if (result.value.length === 1) {
        return result.value[0]
    } else {
        return result.value
    }
}
