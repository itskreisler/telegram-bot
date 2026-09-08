// import JsonDb from '@kreisler/js-jsondb'
import { bot } from '../bot.js'
import { lang } from '../language.js'

const cmdLangRegExp = /^\/lang/
export const cmdlangReplyMarkup = JSON.stringify({
  inline_keyboard: [
    [{ text: '🇪🇸 Spanish', callback_data: 'lang|es' }],
    [{ text: '🇺🇸 English', callback_data: 'lang|en' }]
  ]
})
const cmdLangFn = async (msg) => {
  const chatId = msg.chat.id

  await bot.sendMessage(chatId, lang.lang, { reply_markup: cmdlangReplyMarkup })
}

export { cmdLangFn, cmdLangRegExp }
