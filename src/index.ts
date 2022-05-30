import {
    Expression,
    ExpressionType,
    CountOf,
    CountRangeOf,
    NestedExpression,
    Sequence,
} from "./expression"

export * from "./expression"
export * from "./parsing"

export function compile(ast: Expression): string {
    if (
        ast.type === ExpressionType.MAYBE &&
        (ast as NestedExpression).value.type === ExpressionType.MANY
    ) {
        return `${compile(((ast as NestedExpression).value as NestedExpression).value)}*`
    }

    const result = {
        [ExpressionType.ANY]: (_ast: Expression) => ".",
        [ExpressionType.COUNT_OF]: (ast: CountOf) => `${compile(ast.value)}{${ast.count}}`,
        [ExpressionType.COUNT_RANGE]: (ast: CountRangeOf) =>
            `${compile(ast.value)}{${ast.from},${ast.to}}`,
        [ExpressionType.MAYBE]: (ast: NestedExpression) => `${compile(ast.value)}?`,
        [ExpressionType.MANY]: (ast: NestedExpression) => `${compile(ast.value)}+`,
        [ExpressionType.SEQUENCE]: (ast: Sequence) => `(?:${ast.value.map(compile).join("")})`,
    }[ast.type](ast as any)
    return result
}
