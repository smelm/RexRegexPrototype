export function escapeNewlines(input: string): string {
    return input.replace(/\n/g, "\\n")
}
