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

module.exports = {
  active: true,
  ExpReg: /(?:https?:)?(?:\/\/)?(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*?[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/gim,
  async cmd (bot, { chat: { id }, text }, match) {
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
    bot.sendMessage(id, 'Miniatura del video', options)
  }
}
