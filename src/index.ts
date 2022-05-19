export function tokenize(input: string) {
    return input.split("\n").map(line => line.split(" "))
}

export function translate(input: string) {
    const lines = tokenize(input)
    const result = []

    for (const [token, ...tokens] of lines) {
        if (token === "any" && tokens.length === 0) {
            result.push(".")
        }
    }
}
