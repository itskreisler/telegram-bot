import { bot } from '../bot.js'
import { AUTHORIZED_USERS } from '../config.js'

const cmdOffRegExp = /^\/off/g

const cmdOffFn = async (msg) => {
  const [chatId, fromId, msgId] = [msg.chat.id, msg.from.id, msg.message_id]
  if (!AUTHORIZED_USERS.includes(fromId)) {
    bot.sendMessage(chatId, 'Usuario no autorizado')
  } else {
    bot.sendMessage(chatId, 'Apagando...', { reply_to_message_id: msgId })
    // throw new Error('Apagando...')
  }
}

export { cmdOffFn, cmdOffRegExp }
