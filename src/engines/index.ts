import { spawnSync } from "child_process"

export enum EngineType {
    NODE_JS = "nodejs",
    PYTHON = "python",
}

export interface MatchResult {
    matches: boolean
    groups?: Record<string, string>
}

export interface RegexEngine {
    name: EngineType
    match: (regex: string, input: string) => MatchResult
}

export class NodeJSEngine implements RegexEngine {
    name: EngineType = EngineType.NODE_JS

    match(regex: string, input: string): MatchResult {
        const expr = new RegExp(regex)
        const result = expr.exec(input)

        return { matches: !!result, groups: result?.groups }
    }
}

function runProcess(command: string, args: string[], regex: string, input: string): boolean {
    const { status, stdout } = spawnSync(command, args, {
        input: `${regex}SEP${input}`,
    })

    if (status !== 0) {
        throw new Error("process crashed")
    }

    return parseInt(stdout.toString().trim()) === 1
}
