/* eslint-disable camelcase */
import { bot } from '../bot.js'

const cmdPingRegExp = /^\/ping/
const parse_mode = 'Markdown'
const cmdPingFn = (msg) => {
  const start = new Date()
  const chatId = msg.chat.id
  bot.sendMessage(chatId, '*Pinging...*', { parse_mode }).then(sent => {
    const end = new Date()
    const ping = end - start
    bot.editMessageText(`*Pong! Latency is* \`${ping}ms\``, {
      chat_id: chatId,
      message_id: sent.message_id,
      parse_mode
    })
  })
}

export { cmdPingFn, cmdPingRegExp }
