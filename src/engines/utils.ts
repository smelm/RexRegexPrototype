import { spawnSync } from "child_process"

interface ProcessResult {
    stdout: string
    status: number
    stderr: string
}

export function runProcess(command: string, args: string[], stdin: string): ProcessResult {
    const { status, stdout, stderr } = spawnSync(command, args, {
        input: stdin,
    })

    return {
        status: status || 0,
        stdout: stdout && stdout.toString(),
        stderr: stderr && stderr.toString(),
    }
}
