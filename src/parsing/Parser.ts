import { ParseResult, ok } from "./ParseResult"

export abstract class Parser {
    constructor(public ignored: boolean = false) {}

    abstract parse(input: string): ParseResult

    public builder(builder: Function): Parser {
        return new ParserWithBuilder(this, builder)
    }

    public ignore(): Parser {
        this.ignored = true
        return this
    }
}

class ParserWithBuilder extends Parser {
    constructor(private parser: Parser, private builderFunc: Function) {
        super()
    }

    parse(input: string): ParseResult {
        const result = this.parser.parse(input)

        if (!result.isSuccess) {
            return result
        }

        return ok(this.builderFunc(result.value), result.matched, result.remaining)
    }
}
