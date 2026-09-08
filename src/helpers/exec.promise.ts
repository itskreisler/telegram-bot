import { exec, ExecException } from 'node:child_process'

/**
 * @param comando - Comando a ejecutar
 */
export function execPromise(comando: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    exec(comando, (err: ExecException | null, stdout: string, stderr: string) => {
      if (err) { return reject(err) }
      resolve({ stdout, stderr })
    })
  })
}

export default { execPromise }
