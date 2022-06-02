import {
    Expression,
    ExpressionType,
    CountOf,
    CountRangeOf,
    NestedExpression,
    Sequence,
    Literal,
} from "./ast"
import { ExpressionSequence } from "./parsing/ExpressionSequence"

export * from "./ast"
export * from "./parsing"

// TODO: account for literal escaping
export function compile(ast: Expression): string {
    if (
        ast.type === ExpressionType.MAYBE &&
        (ast as NestedExpression).value.type === ExpressionType.MANY
    ) {
        return `${compile(((ast as NestedExpression).value as NestedExpression).value)}*`
    }

    return {
        [ExpressionType.ANY]: (_ast: Expression) => ".",
        [ExpressionType.COUNT_OF]: (ast: CountOf) => `${compile(ast.value)}{${ast.count}}`,
        [ExpressionType.COUNT_RANGE]: (ast: CountRangeOf) =>
            `${compile(ast.value)}{${ast.from},${ast.to}}`,
        [ExpressionType.MAYBE]: (ast: NestedExpression) => `${compile(ast.value)}?`,
        [ExpressionType.MANY]: (ast: NestedExpression) => `${compile(ast.value)}+`,
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
