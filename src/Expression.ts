import {
    CustomParser,
    ParseResult,
    SequenceParser,
    RepeatParser,
    AlternativeParser,
    newlines,
    optionalSpaces,
    spaces,
    LiteralParser,
    NumberParser,
    IdentifierParser,
} from "./parsing"
import { ANY, BEGIN, END, MANY, MAYBE, OF, TO } from "./keywords"
import { Any, Expression, Maybe, Repeat, sequence, Group } from "./ast"
import { literal as buildLiteral } from "."
import { spaces as _ } from "./parsing"

export const expression = new CustomParser(parseExpression)

const block = new SequenceParser([
    optionalSpaces,
    newlines,
    new RepeatParser(
        new SequenceParser([optionalSpaces, expression, optionalSpaces, newlines]).builder(
            ([val]: Expression[]) => val
        )
    ),
    END,
]).builder(([seq, _end]: Expression[][]) => {
    if (seq.length === 1) {
        return seq[0]
    } else {
        return sequence(seq)
    }
})

export const expressionOrBlock = new AlternativeParser([
    new SequenceParser([spaces, expression]).builder(([exp]: Expression[]) => exp),
    block,
])

function parseExpression(input: string): ParseResult {
    const number = new NumberParser()
    const literal = new LiteralParser().builder(buildLiteral)
    const any = ANY.builder(() => new Any())
    const maybe = new SequenceParser([MAYBE, expressionOrBlock]).builder(
        ([expr]: Expression[]) => new Maybe(expr)
    )
    const countRangeOf = new AlternativeParser([
        new SequenceParser([MANY, _, OF, expressionOrBlock]).builder(
            ([expr]: Expression[]) => new Repeat(expr, 1)
        ),
        new SequenceParser([number, _, OF, expressionOrBlock]).builder(
            ([number, expr]: any[]) => new Repeat(expr, number, number)
        ),
        new SequenceParser([
            number,
            _,
            TO,
            _,
            new AlternativeParser([number, MANY]),
            _,
            OF,
            expressionOrBlock,
        ]).builder(
            ([from, to, expr]: any[]) => new Repeat(expr, from, to === "many" ? undefined : to)
        ),
    ])
    const group = new SequenceParser([BEGIN, _, new IdentifierParser(), expressionOrBlock]).builder(
        ([groupName, content]: [string, Expression]) => new Group(groupName, content)
    )

    const expressions = [literal, any, maybe, countRangeOf, group]

    return new AlternativeParser(expressions).parse(input)
}
