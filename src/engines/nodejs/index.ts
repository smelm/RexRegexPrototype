import { EngineType, MatchResult, RegexEngine } from "../engine"

export class NodeJSEngine implements RegexEngine {
    type: EngineType = EngineType.NODE_JS

    match(regex: string, input: string): MatchResult {
        const expr = new RegExp(regex)
        const result = expr.exec(input)

        return { matches: !!result, groups: result?.groups }
    }
}
