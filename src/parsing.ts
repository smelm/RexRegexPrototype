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
function sequence(...parsers: Parser[]): Parser {
    return function (input: string): ParseResult {
        let values: any[] = []
        let remaining = input
        for (const p of parsers) {
            const result = p(remaining)

            if (!result.isSuccess) {
                return result // is the error
            }

            remaining = result.remaining
            values.push(result.value)
        }

        return ok(values, input, remaining)
    }
}

function alternative(...parsers: Parser[]): Parser {
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

        return ok(f(result), result.matched, result.remaining)
    }
}

function expression(input: string): ParseResult {
    const spc = repeat(alternative(str(" "), str("\t")))
    const newline = alternative(...["\n", "\r", "\r\n"].map(str))
    const kw = {
        any: str("any", EXP.any()),
        maybe: str("maybe"),
        many: str("many"),
        of: str("of"),
    }

    const any = kw.any
    const maybe = withValue(sequence(kw.maybe, spc, expression), ({ value }: ParseResult) =>
        EXP.maybe(value[2])
    )

    const expressions = [any, maybe]

    return alternative(...expressions)(input)
}

export function parse(input: string) {
    const parseDSL = repeat(expression)
    const result = parseDSL(input)

    console.log(result)
    return result.value
}

console.log(parse("maybe any"))
