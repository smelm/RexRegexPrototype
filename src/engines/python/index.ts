import { EngineType, MatchResult, RegexEngine } from "../engine"
import { runProcess } from "../utils"

export class PythonEngine implements RegexEngine {
    type: EngineType = EngineType.PYTHON

    match(regex: string, input: string): MatchResult {
        const { status, stdout } = runProcess(
            "python",
            [`${__dirname}/run.py`],
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
