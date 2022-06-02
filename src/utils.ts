export function intersperse(list: any[], sep: any): any[] {
    return list.flatMap(item => [sep, item]).slice(1)
}

export function escapeNewlines(input: string): string {
    return input.replace(/\n/g, "\\n")
}
