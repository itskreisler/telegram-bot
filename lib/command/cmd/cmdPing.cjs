const { configEnv } = require('../../helpers/Helpers.cjs')

module.exports = {
  active: true,
  ExpReg: new RegExp(`^/ping(?:@${configEnv.USERNAME_BOT})?$`, 'im'), /* /^\/ping(?:@uwunubot)?$/im, */
  /**
   *
   * @param {import('../../core/Client.cjs')} bot
   * @param {import('node-telegram-bot-api').Message} msg
   */
  async cmd (bot, msg) {
    const start = new Date()
    const chatId = msg.chat.id
    bot.sendMessage(chatId, '*Pinging...*', { parse_mode: 'Markdown' }).then(sent => {
      const end = new Date()
      const ping = end - start
      bot.editMessageText(`*Pong! Latency is* \`${ping}ms\``, {
        chat_id: chatId,
        message_id: sent.message_id,
        parse_mode: 'Markdown'
      })
    })
  }
}
