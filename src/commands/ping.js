import { bot } from '../bot.js'

const cmdPingRegExp = /^\/ping/

const cmdPingFn = (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, 'pong')
}

export { cmdPingFn, cmdPingRegExp }
