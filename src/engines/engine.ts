export enum EngineType {
    NODE_JS = "nodejs",
    PYTHON = "python",
    JAVA = "java",
}

export interface MatchResult {
    matches: boolean
    groups?: Record<string, string>
}

export interface RegexEngine {
    type: EngineType
    match: (regex: string, input: string) => MatchResult
}
