// import JsonDb from '@kreisler/js-jsondb'
import { bot } from '../bot.js'
import { lang } from '../language.js'

const cmdLangRegExp = /^\/lang/
// const u = new JsonDb('src/json')
/* const existUser = (id) => {
  const x = u.select('users', ({ fromId }) => fromId === id)
  if (isEmptyArray(x)) {
    return [false, []]
  }
  return [true, x]
} */
const cmdLangFn = (msg) => {
  const chatId = msg.chat.id
  /* console.log(msg);
  const [si] = existUser(msg.from.id);
  if (si && !msg.from.is_bot) {
    u.update("users", (element) => element.fromId === msg.from.id, {
      lang: msg.from.language_code,
    });
  } */
  const options = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: '🇪🇸 Spanish', callback_data: 'lang|es' }],
        [{ text: '🇺🇸 English', callback_data: 'lang|en' }]
      ]
    })
  }

  bot.sendMessage(chatId, lang.lang, options)
}

export { cmdLangFn, cmdLangRegExp }
