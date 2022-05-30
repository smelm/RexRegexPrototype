import * as EXP from "./expression"

interface ParseResult {
    isSuccess: boolean
    remaining: string
    matched: string
    value: any
}

type Parser = (input: string) => ParseResult

function ok(value: any, matched: string, remaining: string): ParseResult {
    return { isSuccess: true, value, matched, remaining }
}

function err(input: string, message: string): ParseResult {
    return { isSuccess: false, value: message, matched: "", remaining: input }
}

const spc = repeat(alternative([str(" "), str("\t")]))

function str(str: string, value?: any): Parser {
    if (!value) {
        value = str
    }

    return function (input: string): ParseResult {
        if (input.startsWith(str)) {
            return ok(value, str, input.slice(str.length))
        } else {
            return err(input, `expected '${str}' but got '${input}'`)
        }
    }
}

// TODO format value
function sequenceWithIgnore(parsers: { parser: Parser; ignored: boolean }[]): Parser {
    return function (input: string): ParseResult {
        let values: any[] = []
        let remaining = input
        for (const { parser, ignored } of parsers) {
            const result = parser(remaining)

            if (!result.isSuccess) {
                return result // is the error
            }

            remaining = result.remaining

            if (!ignored) {
                values.push(result.value)
            }
        }

        return ok(values, input, remaining)
    }
}

function tokenSequence(...tokens: Parser[]): Parser {
    let parsers = tokens.map(parser => ({ parser, ignored: false }))
    parsers = intersperse(parsers, { parser: spc, ignored: true })

    return sequenceWithIgnore(parsers)
}

function alternative(parsers: Parser[]): Parser {
    return function (input: string): ParseResult {
        const errors: string[] = []
        for (const p of parsers) {
            const result = p(input)

            if (result.isSuccess) {
                return result
            }

            errors.push(result.value)
        }
        return err(input, `no alternative matched: \n${errors.map(err => "    " + err).join("\n")}`)
    }
}

function repeat(parser: Parser, optional: boolean = false): Parser {
    return function (input: string): ParseResult {
        let values: any[] = []

        let result = parser(input)

        while (result.isSuccess) {
            values.push(result.value)
            result = parser(result.remaining)
        }

        if (!optional && values.length === 0) {
            return err(input, `expected at least one but ran into error: ${result.value}`)
        }

        return ok(values, input.slice(0, result.remaining.length), result.remaining)
    }
}

function withValue(parser: Parser, f: Function): Parser {
    return function (input: string): ParseResult {
        const result = parser(input)

        if (!result.isSuccess) {
            return result
        }

        return ok(f(result.value), result.matched, result.remaining)
    }
}

function intersperse(list: any[], sep: any): any[] {
    return list.flatMap(item => [sep, item]).slice(1)
}

function expression(input: string): ParseResult {
    //const newline = alternative(["\n", "\r", "\r\n"].map(str))

    const number = withValue(
        repeat(alternative("0123456789".split("").map(str))),
        (value: string) => parseInt(value)
    )

    const kw = {
        any: str("any", EXP.any()),
        maybe: str("maybe"),
        many: str("many"),
        of: str("of"),
        to: str("to"),
    }

    const any = kw.any
    const maybe = withValue(tokenSequence(kw.maybe, expression), (value: EXP.Expression[]) =>
        EXP.maybe(value[1])
    )

    const manyOf = withValue(
        tokenSequence(kw.many, kw.of, expression),
        (value: EXP.Expression[]) => {
            return EXP.manyOf(value[2])
        }
    )
    const countOf = withValue(tokenSequence(number, kw.of, expression), (value: any[]) =>
        EXP.countOf(value[0], value[2])
    )
    const countRangeOf = withValue(
        tokenSequence(number, kw.to, number, kw.of, expression),
        (value: any[]) => EXP.countRangeOf(value[0], value[2], value[4])
    )

    const expressions = [any, maybe, manyOf, countOf, countRangeOf]

    return alternative(expressions)(input)
}

export function parse(input: string) {
    const parseDSL = repeat(expression)
    const result = parseDSL(input)

    if (result.value.length === 1) {
        return result.value[0]
    } else {
        return result.value
    }
}
