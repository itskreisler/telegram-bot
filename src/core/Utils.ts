import { glob } from 'glob'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Utils.ts sits in src/core or dist/core
const srcOrDistDir = path.resolve(__dirname, '..')

export default class BotUtils {
  client: any
  constructor (client: any) {
    this.client = client
  }

  async loadFiles (dirName: string): Promise<string[]> {
    // dirName can be '/lib/command' or 'command' or '/command'
    const cleanDir = dirName.replace(/^\/(lib|src|dist)\//, '').replace(/^\//, '')
    const baseDir = srcOrDistDir.replace(/\\/g, '/')
    const pattern = `${baseDir}/${cleanDir}/**/!(*.test*).{ts,js,json}`
    const files = await glob(pattern)
    return files
  }
}
