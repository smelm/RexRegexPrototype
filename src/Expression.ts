import {
    CustomParser,
    ParseResult,
    SequenceParser,
    RepeatParser,
    AlternativeParser,
    newlines,
    optionalSpaces,
    spaces,
} from "./parsing"
import { END } from "./keywords"
import { Any, Expression, Character, Maybe, Repeat, sequence, Group } from "./ast"

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
    const literal = Character.parser
    const any = Any.parser
    const maybe = Maybe.parser
    const countRangeOf = Repeat.parser
    const group = Group.parser

    const expressions = [literal, any, maybe, countRangeOf, group]

    return new AlternativeParser(expressions).parse(input)
}
