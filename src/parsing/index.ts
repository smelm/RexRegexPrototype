import { ExpressionSequence } from "./ExpressionSequence"

export function parse(input: string) {
    const { value, remaining, isSuccess } = new ExpressionSequence().parse(input)

    if (isSuccess && remaining !== "") {
        return `input could not be parsed completely, "${remaining} could not be parsed"`
    }

    if (value.length === 1) {
        return value[0]
    } else {
        return value
    }
}
