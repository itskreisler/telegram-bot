import { create } from 'youtube-dl-exec'
import { glob } from 'glob'
import fs from 'node:fs'

const exec = create('yt-dlp')
const VIDEO_TYPES = Object.freeze({ embed: 'embed', shorts: 'shorts' } as const)

const getVideoIdFromURl = (text: string) => {
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
    return searchParams.get('v')!
  }
}

const url = (text: string, id: string) => 'https://img.youtube.com/vi/'.concat(getVideoIdFromURl(text), '/', id, '.jpg')
const qualities = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault']

async function loadFiles (dirName: string) {
  const patternGlob = `${process.cwd().replace(/\\/g, '/')}/${dirName}/!(*.test*).{mp3,flac}`
  const files = await glob(patternGlob)
  return files
}

const tempDir = './tmp/'

export default {
  active: true,
  ExpReg: /(?:https?:)?(?:\/\/)?(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*?[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/gim,
  async cmd (bot: any, { chat: { id: chatId }, text }: any, match: any) {
    const [youtubeUrl] = match
    const options = {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          ...qualities.map((quality) => [
            {
              text: quality,
              url: url(text, quality)
            }
          ]),
          [{ text: '🎬 Descargar Video', callback_data: 'yt_video|' + youtubeUrl }]
        ]
      })
    }
    bot.sendMessage(chatId, 'Miniatura del video', options)

    const outputDir = tempDir.concat(Date.now().toString())
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    const sms = await bot.sendMessage(chatId, 'Comenzando descarga...')
    const ytFlags = {
      audioQuality: 0,
      extractAudio: true,
      audioFormat: 'mp3',
      output: `${outputDir}/%(title)s.%(ext)s`,
      addMetadata: true,
      embedThumbnail: true,
      noPlaylist: true,
      cookies: 'a.txt',
      update: true,
      jsRuntimes: 'node',
      extractorArgs: 'youtube:player-client=default,-web_safari',
      remoteComponents: 'ejs:github'
    }
    // 'yt-dlp --audio-quality 0 --extract-audio --audio-format mp3 --output ./tmp/1788840104203/%(title)s.%(ext)s --add-metadata --embed-thumbnail --no-playlist --cookies a.txt --update --js-runtimes node --extractor-args youtube:player-client=default,-web_safari --remote-components ejs:github -- {url}'
    const optionsEdits = {
      chat_id: chatId,
      message_id: sms.message_id
    }
    try {
      bot.editMessageText('Descargando audio...', optionsEdits)
      await exec(youtubeUrl, ytFlags as any)
      const [audio] = await loadFiles(outputDir)
      bot.editMessageText('Subiendo audio...', optionsEdits)
      if (typeof audio !== 'undefined') {
        await bot.sendAudio(chatId, audio, { caption: 'Audio descargado desde youtube' })
        await bot.deleteMessage(chatId, sms.message_id)
      }
      fs.rmSync(outputDir, { recursive: true })
    } catch (error) {
      await bot.deleteMessage(chatId, sms.message_id)
      bot.sendMessage(chatId, 'Ahora mismo este comando no esta disponible, lamentamos las molestias, te invitamos a usar otro bot @usharebot')
      if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true })
      }
      console.error(error)
    }
  }
}
