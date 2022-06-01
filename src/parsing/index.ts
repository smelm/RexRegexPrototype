import { ExpressionSequence } from "./ExpressionSequence"

export function parse(input: string) {
    const result = new ExpressionSequence().parse(input)

    if (result.value.length === 1) {
        return result.value[0]
    } else {
        return result.value
    }
}
