const { exec } = require('youtube-dl-exec')
const { glob } = require('glob')
const fs = require('fs')
const VIDEO_TYPES = Object.freeze({ embed: 'embed', shorts: 'shorts' })
const getVideoIdFromURl = (text) => {
  const { searchParams, pathname } = new URL(text)
  if (!searchParams.get('v')) {
    const pathSplit = pathname.split('/')
    if (pathSplit.some((pathValue) => pathValue === VIDEO_TYPES.embed)) {
      return pathSplit[2]
    }
    if (pathSplit.some((pathValue) => pathValue === VIDEO_TYPES.shorts)) {
      return pathSplit[2]
    }
    return pathSplit[1]
  } else {
    return searchParams.get('v')
  }
}
const url = (text, id) => 'https://img.youtube.com/vi/'.concat(getVideoIdFromURl(text), '/', id, '.jpg')
const qualities = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault']
//
async function loadFiles (dirName) {
  // usalo si usas la version glob@^10.2.2
  // const Files = await glob(`${process.cwd().replace(/\\/g, '/')}/${dirName}/**/*.{mp3,flac}`)
  const patternGlob = `${process.cwd().replace(/\\/g, '/')}/${dirName}/!(*.test*).{mp3,flac}`
  const files = await glob(patternGlob)
  // files.forEach((file) => delete require.cache[require.resolve(file)])
  return files
}
const tempDir = './tmp/'
module.exports = {
  active: true,
  ExpReg: /(?:https?:)?(?:\/\/)?(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*?[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/gim,
  /**
   *
   * @param {import('node-telegram-bot-api')} bot
   * @param {import('node-telegram-bot-api').Message} msg
   * @param {string[]} match
   */
  async cmd (bot, { chat: { id: chatId }, text }, match) {
    const options = {
      reply_markup: JSON.stringify({
        inline_keyboard: qualities.map((quality) => [
          {
            text: quality,
            url: url(text, quality)
          }
        ])
      })
    }
    bot.sendMessage(chatId, 'Miniatura del video', options)
    //
    const outputDir = tempDir.concat(Date.now())
    const outputFile = 'tmp/'.concat(Date.now())
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir)
    }
    const [youtubeUrl] = match

    const sms = await bot.sendMessage(chatId, 'Comenzando descarga...')
    const ytFlags = {
      audioQuality: 0,
      extractAudio: true,
      audioFormat: 'mp3',
      // ffmpegLocation: 'C:/ProgramData/chocolatey/lib/ffmpeg/tools/ffmpeg/bin/ffprobe.exe',
      output: `${outputDir}/%(title)s.%(ext)s`,
      addMetadata: true,
      embedThumbnail: true,
      noPlaylist: true
    }
    const optionsEdits = {
      chat_id: chatId,
      message_id: sms.message_id
    }
    try {
      bot.editMessageText('Descargando audio...', optionsEdits)
      await exec(youtubeUrl, ytFlags)
      const [audio] = await loadFiles(outputFile)
      bot.editMessageText('Subiendo audio...', optionsEdits)
      if (typeof audio !== 'undefined') {
        // const stream = fs.createReadStream(audio)
        // const buffer = fs.readFileSync(audio);
        await bot.sendAudio(chatId, audio, { caption: 'Audio descargado desde youtube' })
        await bot.deleteMessage(chatId, sms.message_id)
        fs.rmSync(outputDir, { recursive: true })
      }
    } catch (error) {
      bot.sendMessage(chatId, 'Ha ocurrido un error al descargar el audio')
      fs.rmSync(outputDir, { recursive: true })
      console.error(error)
    } finally {
      //

    }
  }
}
