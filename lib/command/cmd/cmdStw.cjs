const { configEnv } = require('../../helpers/Helpers.cjs')
const { fetchAndSendStw, getStwCaption } = require('../../helpers/stw.helper.cjs')

module.exports = {
  active: true,
  OWNER: false,
  ExpReg: new RegExp(`^/stw(?:@${configEnv.USERNAME_BOT})?$`, 'im'),
  async cmd(bot, msg) {
    const chatId = msg.chat.id
    
    const loading = await bot.sendMessage(chatId, '⏳ Obteniendo imagen...')
    
    try {
      const caption = getStwCaption()
      await fetchAndSendStw(bot, chatId, caption)
      await bot.deleteMessage(chatId, loading.message_id)
    } catch (error) {
      await bot.editMessageText(`❌ Error: ${error.message}`, {
        chat_id: chatId,
        message_id: loading.message_id
      })
    }
  }
}