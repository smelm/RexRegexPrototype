import { Reply } from "parsimmon"
import { ParseResult } from "./ParseResult"

export function escapeNewlines(input: string): string {
    return input.replace(/\n/g, "\\n")
}

export function resultToReply<T>(reply: Reply<T>): ParseResult {
    return {
        isSuccess: reply.status,
        remaining: "",
        matched: "",
        value: reply.value,
    }
}
