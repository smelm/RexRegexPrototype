import { EngineType, MatchResult, RegexEngine } from "../engine"
import { runProcess } from "../utils"

export class JavaEngine implements RegexEngine {
    type: EngineType = EngineType.JAVA

    constructor() {
        const { status } = runProcess("javac", [`${__dirname}/JavaRegexEngine.java`], "")
        if (status !== 0) {
            throw new Error("could not compile java engine")
        }
    }

    match(regex: string, input: string): MatchResult {
        const { status, stdout, stderr } = runProcess(
            "java",
            ["-cp", __dirname, "--illegal-access=warn", "JavaRegexEngine", regex, input],
            ""
        )

        if (status !== 0) {
            console.log("stderr", stderr)
            throw new Error("java process failed")
        }

        let [matchesStr, ...groupsStrs] = stdout.trim().split("\n")

        let matches: boolean = JSON.parse(matchesStr)

        let groups = undefined

        if (groupsStrs.length !== 0) {
            groups = Object.fromEntries(groupsStrs.map(s => s.split(":", 2)))
        }

        return { matches, groups }
    }
}

new JavaEngine()
