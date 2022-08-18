import { any, Expression, sequence } from "./ast"
import { Parser, string } from "parsimmon"

export * from "./ast"

export function parse(input: string): Expression {
    let expressionParser: Parser<Expression> = string("any").map(any)
    let dslParser: Parser<Expression[]> = expressionParser.many()

    let result = dslParser.tryParse(input)

    if (result.length === 1) {
        return result[0]
    } else {
        return sequence(result)
    }
}
