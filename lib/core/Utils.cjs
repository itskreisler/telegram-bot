const { glob } = require('glob')
const { promisify } = require('util')
const proGlob = promisify(glob)

module.exports = class BotUtils {
  constructor (client) {
    this.client = client
  }

  async loadFiles (dirName) {
    const Files = await proGlob(`${process.cwd().replace(/\\/g, '/')}/${dirName}/**/*.{cjs,js,json}`)
    Files.forEach((file) => delete require.cache[require.resolve(file)])
    return Files
  }
}
