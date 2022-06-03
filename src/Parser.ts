import { ParseResult, ok } from "./ParseResult"

export interface Parser {
    ignored: boolean
    parse: (input: string) => ParseResult
    /**
     * ignore parser result in building the ast
     */
    ignore: () => Parser
    /**
     * add an ast builder to parser
     */
    builder: (builderFunc: Function) => Parser
}

export class BaseParser implements Parser {
    public ignored: boolean = false

    public parse(_input: string): ParseResult {
        throw new Error("parser not implemented")
    }

    public ignore(): Parser {
        this.ignored = true
        return this
    }

    public builder(builder: Function): Parser {
        return new ParserWithBuilder(this, builder)
    }
}

export class CustomParser extends BaseParser {
    constructor(private parseFunc: (input: string) => ParseResult) {
        super()
    }

    parse(input: string): ParseResult {
        return this.parseFunc(input)
    }
}

class ParserWithBuilder extends BaseParser {
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
