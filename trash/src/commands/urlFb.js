import { bot } from '../bot.js'

import { fbDl } from '../fbDl.js'

const cmdUrlFbRegExp = /https:\/\/www\.facebook\.com\/\S+\/videos\/\S+|https:\/\/fb\.watch\/\S+|https:\/\/www\.facebook\.com\/\S+\/posts\/\S+/

const cmdUrlFbFn = async (msg, math) => {
  const chatId = msg.chat.id
  await fbDl(msg.text, async (x) => {
    if ('mess' in x) {
      bot.sendMessage(chatId, x.mess, { parse_mode: 'HTML' })
    } else {
      try {
        await bot.sendVideo(chatId, x.SD)
      } catch (_error) {
        const cal = ['HD', 'SD']
        const options = {
          reply_markup: JSON.stringify({
            inline_keyboard: cal.map((_) => [
              {
                text: _,
                url: x[_]
              }
            ])
          })
        }
        await bot.sendMessage(chatId, 'Seleciona la calidad del video', options)
      }
    }
  })
}

export { cmdUrlFbRegExp, cmdUrlFbFn }
