import { regex, alt, Parser, seqObj, whitespace as _, string } from "parsimmon"
import { kw } from "./keywords"

export type BlockResult<T, U> = { header: T; content: U; type: "block" | "line" }

export const statementSeperator: Parser<string> = regex(/( *[\n\r] *)+/).desc("statement_separator")
export const optionalStatementSeperator: Parser<string> = regex(/( *[\n\r] *)*/)
export const DOT = string(".").desc("DOT")

export function line<T, U>(header: Parser<T>, expression: Parser<U>): Parser<BlockResult<T, U>> {
    return seqObj<BlockResult<T, U>>(["header", header], _, ["content", expression]).map(obj => ({
        ...obj,
        type: "line",
    }))
}

export function block<T, U>(header: Parser<T>, content: Parser<U>): Parser<BlockResult<T, U>> {
    return seqObj<{ header: any; content: any }>(
        ["header", header],
        statementSeperator,
        ["content", content],
        statementSeperator,
        kw.end
    ).map(obj => ({ ...obj, type: "block" }))
}

export function lineOrBlock<T, U>(
    header: Parser<T>,
    content: Parser<U>,
    contentSequence: Parser<U>
): Parser<BlockResult<T, U>> {
    return alt(block(header, contentSequence), line(header, content))
}

export function opt<T>(p: Parser<T>): Parser<T> {
    return p.atMost(1).map(x => x[0])
}
