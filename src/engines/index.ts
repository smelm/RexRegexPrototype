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
    type: EngineType
    match: (regex: string, input: string) => MatchResult
}

export class NodeJSEngine implements RegexEngine {
    type: EngineType = EngineType.NODE_JS

    match(regex: string, input: string): MatchResult {
        const expr = new RegExp(regex)
        const result = expr.exec(input)

        return { matches: !!result, groups: result?.groups }
    }
}

export class PythonEngine implements RegexEngine {
    type: EngineType = EngineType.PYTHON

    match(regex: string, input: string): MatchResult {
        const { status, stdout } = runProcess(
            "python",
            [`${__dirname}/python/run.py`],
            JSON.stringify({ regex, input })
        )
        if (status !== 0) {
            throw new Error("python process failed")
        }

        const result = JSON.parse(stdout)

        if (!result.groups || Object.keys(result.groups).length === 0) {
            return { ...result, groups: undefined }
        } else {
            return { ...result }
        }
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
