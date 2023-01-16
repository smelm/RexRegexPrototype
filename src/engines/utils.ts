import { spawnSync } from "child_process"

interface ProcessResult {
    stdout: string
    status: number
}

export function runProcess(command: string, args: string[], stdin: string): ProcessResult {
    const { status, stdout } = spawnSync(command, args, {
        input: stdin,
    })

    return { status: status || 0, stdout: stdout.toString() }
}
