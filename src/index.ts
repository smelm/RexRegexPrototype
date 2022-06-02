import { Expression, ExpressionType, CountOf, CountRangeOf, Sequence, Literal } from "./ast"
import { ExpressionSequence } from "./ExpressionSequence"

export * from "./ast"

// TODO: account for literal escaping
export function compile(ast: Expression): string {
    if (
        ast.type === ExpressionType.MAYBE &&
        (ast.value as Expression).type === ExpressionType.MANY
    ) {
        return `${compile(((ast as Expression).value as Expression).value)}*`
    }

    return {
        [ExpressionType.ANY]: (_ast: Expression) => ".",
        [ExpressionType.COUNT_OF]: (ast: CountOf) => `${compile(ast.value)}{${ast.count}}`,
        [ExpressionType.COUNT_RANGE]: (ast: CountRangeOf) =>
            `${compile(ast.value)}{${ast.from},${ast.to}}`,
        [ExpressionType.MAYBE]: (ast: Expression) => `${compile(ast.value)}?`,
        [ExpressionType.MANY]: (ast: Expression) => `${compile(ast.value)}+`,
        [ExpressionType.SEQUENCE]: (ast: Sequence) => `(?:${ast.value.map(compile).join("")})`,
        [ExpressionType.LITERAL]: (ast: Literal) => ast.value,
    }[ast.type](ast as any)
}

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
