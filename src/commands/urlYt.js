import { bot } from '../bot.js'
const cmdUrlYtRegExp =
  /(?:https?:)?(?:\/\/)?(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*?[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/gim

const cmdUrlYtFn = async (msg, math) => {
  // console.log(math);
  const { searchParams, pathname } = new URL(msg.text)
  let v
  if (!searchParams.get('v')) {
    const [path] = (() => {
      const tmp = pathname.split('/')
      if (tmp.some((_) => _ === 'embed')) {
        return [tmp[2]]
      }
      return [tmp[1]]
    })()
    v = path
  } else {
    v = searchParams.get('v')
  }
  const cal = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault']
  /* const imgs = cal.map((_) => ({
      url: `https://img.youtube.com/vi/${v}/${_}.jpg`,
    })); */
  const chatId = msg.chat.id
  const options = {
    reply_markup: JSON.stringify({
      inline_keyboard: cal.map((_) => [
        {
          text: _,
          url: `https://img.youtube.com/vi/${v}/${_}.jpg`
        }
      ])
    })
  }

  bot.sendMessage(chatId, 'Seleciona la calidad de la imagen', options)
  // console.log(imgs);
}

export { cmdUrlYtFn, cmdUrlYtRegExp }
