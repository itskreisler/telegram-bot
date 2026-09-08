import { glob } from 'glob'

export default class BotUtils {
    client: unknown

    constructor(client: unknown) {
        this.client = client
    }

    async loadFiles(dirName: string) {
        const files = await glob(`${process.cwd().replace(/\\/g, '/')}/${dirName}/**/!(*.test*).{js,cjs,json}`)
        return files
    }
}
