import { ExpressionType, Repeat, Sequence, Character, Expression } from "./ast"
import { ExpressionSequenceParser } from "./ExpressionSequence"

export * from "./ast"

//TODO make sure that each branch is tested
function compileRepeatOperator({ lower: lowerBound, upper: upperBound }: Repeat) {
    if (lowerBound == null) {
        throw new Error(
            "to avoid ambiguity between 0 or 1 repetitions, the lower bound of the repeat operator may not be undefined"
        )
    }

    const noUpperBound = upperBound == null

    if (noUpperBound) {
        switch (lowerBound) {
            case 0:
                return `*`
            case 1:
                return "+"
            default:
                return `{${lowerBound},}`
        }
    } else {
        if (lowerBound === upperBound) {
            return `{${lowerBound}}`
        } else {
            return `{${lowerBound},${upperBound}}`
        }
    }
}

// TODO: account for literal escaping
export function compile(ast: Expression): string {
    return {
        [ExpressionType.ANY]: (_ast: Expression) => ".",
        [ExpressionType.REPEAT]: (ast: Repeat) =>
            `${compile(ast.value)}${compileRepeatOperator(ast)}`,
        [ExpressionType.MAYBE]: (ast: Expression) => `${compile(ast.value)}?`,
        [ExpressionType.SEQUENCE]: (ast: Sequence) => `(?:${ast.value.map(compile).join("")})`,
        [ExpressionType.CHARACTER]: (ast: Character) => ast.value,
    }[ast.type](ast as any)
}

export function parse(input: string) {
    const { value, remaining, isSuccess } = new ExpressionSequenceParser().parse(input)

    if (isSuccess && remaining !== "") {
        return `input could not be parsed completely, "${remaining} could not be parsed"`
    }

    if (value.length === 1) {
        return value[0]
    } else {
        return value
    }
}
