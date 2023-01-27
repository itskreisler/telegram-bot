const { configEnv } = require('../../helpers/Helpers.cjs')

module.exports = {
  active: true,
  ExpReg: new RegExp(`^/start(?:@${configEnv.USERNAME_BOT})?$`, 'im'),
  async cmd (bot, msg) {
    const chatId = msg.chat.id
    bot.sendMessage(chatId, 'El comando /start esta en desarrollo')
  }
}
