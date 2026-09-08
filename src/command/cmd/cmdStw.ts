import { configEnv } from '../../helpers/Helpers.js'
import { fetchAndSendStw, getStwCaption } from '../../helpers/stw.helper.js'

export default {
  active: true,
  OWNER: false,
  ExpReg: new RegExp(`^/stw(?:@${configEnv.USERNAME_BOT})?$`, 'im'),
  async cmd(bot: any, msg: any) {
    const chatId = msg.chat.id
    
    const loading = await bot.sendMessage(chatId, '⏳ Obteniendo imagen...')
    
    try {
      const caption = getStwCaption()
      await fetchAndSendStw(bot, chatId, caption)
      await bot.deleteMessage(chatId, loading.message_id)
    } catch (error: any) {
      await bot.editMessageText(`❌ Error: ${error.message}`, {
        chat_id: chatId,
        message_id: loading.message_id
      })
    }
  }
}
