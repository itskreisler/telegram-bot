import { bot } from '../bot.js'

export const cmdHelpRegExp = /^\/ping/

export const cmdHelpFn = (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, 'pong')
}
