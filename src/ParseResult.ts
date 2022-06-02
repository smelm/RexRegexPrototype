export interface ParseResult {
    isSuccess: boolean
    remaining: string
    matched: string
    value: any
}

export function ok(value: any, matched: string, remaining: string): ParseResult {
    return { isSuccess: true, value, matched, remaining }
}

export function err(input: string, message: string): ParseResult {
    return { isSuccess: false, value: message, matched: "", remaining: input }
}
