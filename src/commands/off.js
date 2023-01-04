import { bot } from '../bot.js'
import { AUTHORIZED_USERS } from '../config.js'

const cmdOffRegExp = /^\/off/g

const cmdOffFn = async (msg) => {
  const [chatId, fromId] = [msg.chat.id, msg.from.id]
  if (!AUTHORIZED_USERS.includes(fromId)) {
    bot.sendMessage(chatId, 'Usuario no autorizado')
  } else {
    bot.sendMessage(chatId, 'Apagando...')
    // throw new Error('Apagando...')
  }
}

export { cmdOffFn, cmdOffRegExp }
