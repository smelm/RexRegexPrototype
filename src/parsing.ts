import * as EXP from "./expression"

interface ParseResult {
    isSuccess: boolean
    remaining: string
    matched: string
    value: any
}

function ok(value: any, matched: string, remaining: string): ParseResult {
    return { isSuccess: true, value, matched, remaining }
}

function err(input: string, message: string): ParseResult {
    return { isSuccess: false, value: message, matched: "", remaining: input }
}

abstract class Parser {
    constructor(public ignored: boolean = false) {}
    abstract parse(input: string): ParseResult

    public withValue(func: Function): Parser {
        return new ValueTransformingParser(this, func)
    }
}

class ValueTransformingParser extends Parser {
    constructor(private parser: Parser, private transform: Function) {
        super()
    }

    parse(input: string): ParseResult {
        const result = this.parser.parse(input)

        if (!result.isSuccess) {
            return result
        }

        return ok(this.transform(result.value), result.matched, result.remaining)
    }
}

class StringParser extends Parser {
    constructor(private str: string, private value?: any, ignored: boolean = false) {
        super(ignored)

        if (!this.value) {
            this.value = str
        }
    }

    parse(input: string): ParseResult {
        if (input.startsWith(this.str)) {
            return ok(this.value, this.str, input.slice(this.str.length))
        } else {
            return err(input, `expected '${this.str}' but got '${input}'`)
        }
    }
}

class Alternative extends Parser {
    constructor(private parsers: Parser[], ignored: boolean = false) {
        super(ignored)
    }

    parse(input: string): ParseResult {
        const errors: string[] = []
        for (const p of this.parsers) {
            const result = p.parse(input)

            if (result.isSuccess) {
                return result
            }

            errors.push(result.value)
        }
        return err(input, `no alternative matched: \n${errors.map(err => "    " + err).join("\n")}`)
    }
}

class Repeat extends Parser {
    constructor(
        private parser: Parser,
        private optional: boolean = false,
        ignored: boolean = false
    ) {
        super(ignored)
    }

    parse(input: string): ParseResult {
        let values: any[] = []

        let result = this.parser.parse(input)

        while (result.isSuccess) {
            values.push(result.value)
            result = this.parser.parse(result.remaining)
        }

        if (!this.optional && values.length === 0) {
            return err(input, `expected at least one but ran into error: ${result.value}`)
        }

        return ok(values, input.slice(0, result.remaining.length), result.remaining)
    }
}

const spc = new Repeat(
    new Alternative([new StringParser(" "), new StringParser("\t")]),
    false,
    true
)

class Sequence extends Parser {
    constructor(private parsers: Parser[], ignored: boolean = false) {
        super(ignored)
    }

    parse(input: string): ParseResult {
        let values: any[] = []
        let remaining = input
        for (const parser of this.parsers) {
            const result = parser.parse(remaining)

            if (!result.isSuccess) {
                return result // is the error
            }

            remaining = result.remaining

            if (!parser.ignored) {
                values.push(result.value)
            }
        }

        return ok(values, input, remaining)
    }

    public static tokens(...parsers: Parser[]): Parser {
        return new Sequence(intersperse(parsers, spc))
    }
}

function intersperse(list: any[], sep: any): any[] {
    return list.flatMap(item => [sep, item]).slice(1)
}

class Expression extends Parser {
    parse(input: string): ParseResult {
        const expression = this
        //const newline = alternative(["\n", "\r", "\r\n"].map(str))

        const number = new Repeat(
            new Alternative("0123456789".split("").map(n => new StringParser(n)))
        ).withValue(parseInt)

        const kw = {
            any: new StringParser("any", EXP.any()),
            maybe: new StringParser("maybe"),
            many: new StringParser("many"),
            of: new StringParser("of"),
            to: new StringParser("to"),
        }

        const any = kw.any
        const maybe = Sequence.tokens(kw.maybe, expression).withValue((value: EXP.Expression[]) =>
            EXP.maybe(value[1])
        )

        const manyOf = Sequence.tokens(kw.many, kw.of, expression).withValue(
            (value: EXP.Expression[]) => EXP.manyOf(value[2])
        )

        const countOf = Sequence.tokens(number, kw.of, expression).withValue((value: any[]) =>
            EXP.countOf(value[0], value[2])
        )

        const countRangeOf = Sequence.tokens(number, kw.to, number, kw.of, expression).withValue(
            (value: any[]) => EXP.countRangeOf(value[0], value[2], value[4])
        )

        const expressions = [any, maybe, manyOf, countOf, countRangeOf]

        return new Alternative(expressions).parse(input)
    }
}

export function parse(input: string) {
    const result = new Repeat(new Expression()).parse(input)

    if (result.value.length === 1) {
        return result.value[0]
    } else {
        return result.value
    }
}
