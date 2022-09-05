interface MatchResult {
    matches: boolean
    groups?: Record<string, string>
}

interface RegexEngine {
    name: string
    match: (regex: string, input: string) => MatchResult
}

const NODEJS: RegexEngine = {
    name: "nodejs",
    match: (regex: string, input: string) => {
        const expr = new RegExp(regex)
        const result = expr.exec(input)

        return { matches: !!result, groups: result?.groups }
    },
}

export const ENGINES: [string, RegexEngine][] = [/*PYTHON, PERL,*/ NODEJS].map(e => [e.name, e])
