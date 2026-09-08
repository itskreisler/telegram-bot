import { exec } from 'node:child_process'

export interface ExecResult {
  stdout: string
  stderr: string
}

export function execPromise(command: string): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) { return reject(error) }
      resolve({ stdout, stderr })
    })
  })
}

