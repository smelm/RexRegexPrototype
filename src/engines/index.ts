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

export class PythonEngine implements RegexEngine {
    name: EngineType = EngineType.PYTHON

    match(regex: string, input: string): MatchResult {
        const { status, stdout } = runProcess(
            "python",
            [`${__dirname}/python/run.py`],
            JSON.stringify({ regex, input })
        )
        if (status !== 0) {
            throw new Error("python process failed")
        }

        return JSON.parse(stdout)
    }
}

interface ProcessResult {
    stdout: string
    status: number
}

function runProcess(command: string, args: string[], stdin: string): ProcessResult {
    const { status, stdout } = spawnSync(command, args, {
        input: stdin,
    })

    return { status: status || 0, stdout: stdout.toString() }
}
