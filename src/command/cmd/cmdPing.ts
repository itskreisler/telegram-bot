import { configEnv } from '../../helpers/Helpers.js'

export default {
  active: true,
  ExpReg: new RegExp(`^/ping(?:@${configEnv.USERNAME_BOT})?$`, 'im'),
  async cmd (bot: any, msg: any) {
    const start = new Date().getTime()
    const chatId = msg.chat.id
    bot.sendMessage(chatId, '*Pinging...*', { parse_mode: 'Markdown' }).then((sent: any) => {
      const end = new Date().getTime()
      const ping = end - start
      bot.editMessageText(`*Pong! Latency is* \`${ping}ms\``, {
        chat_id: chatId,
        message_id: sent.message_id,
        parse_mode: 'Markdown'
      })
    })
  }
}
