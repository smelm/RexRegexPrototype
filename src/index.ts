export function tokenize(input: string) {
    return input.split("\n").map(line => line.split(" "))
}

function translateExpression(tokens: string[]): string {
    if (tokens[0] === "any" && tokens.length === 1) {
        return "."
    } else if (tokens[0] === "many" && tokens[1] === "of") {
        return translateExpression(tokens.slice(2)) + "+"
    }
}

export function translate(input: string): string {
    return tokenize(input).map(translateExpression).join("")
}
