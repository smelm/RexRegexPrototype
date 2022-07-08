import {
    BaseParser,
    ParseResult,
    SequenceParser,
    RepeatParser,
    newlines,
    optionalSpaces,
} from "./parsing"
import { expression } from "./Expression"
import { Expression, sequence } from "./ast"

export class ExpressionSequenceParser extends BaseParser {
    private parser = new SequenceParser([
        optionalSpaces,
        expression,
        optionalSpaces,
        new RepeatParser(
            new SequenceParser([newlines, optionalSpaces, expression, optionalSpaces]).builder(
                (exp: Expression[]) => exp[0]
            ),
            true
        ),
    ]).builder(([head, tail]: [Expression, Expression[]]) => {
        const seq = [head, ...tail]

        if (seq.length === 1) {
            return seq[0]
        } else {
            return sequence(seq)
        }
    })

    parse(input: string): ParseResult {
        return this.parser.parse(input)
    }
}

export const expressionSequenceParser = new ExpressionSequenceParser()
