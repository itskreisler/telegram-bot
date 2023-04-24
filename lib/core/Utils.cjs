const { glob } = require('glob')
// FIX: glob@10.2.2 no funciona con promisify, en su lugar usar directamente glob
// const { promisify } = require('util')
// const proGlob = promisify(glob)

module.exports = class BotUtils {
  constructor (client) {
    this.client = client
  }

  async loadFiles (dirName) {
    // usalo si usas la version glob@10.2.2
    const Files = await glob(`${process.cwd().replace(/\\/g, '/')}/${dirName}/**/*.{cjs,js,json}`)

    // usalo si usas la version glob@8
    // const Files = await proGlob(`${process.cwd().replace(/\\/g, '/')}/${dirName}/**/*.{cjs,js,json}`)

    Files.forEach((file) => delete require.cache[require.resolve(file)])

    return Files
  }
}
