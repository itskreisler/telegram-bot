const { configEnv } = require('../../helpers/Helpers.cjs')

/**
 * @property {Boolean} active
 * @property {Boolean} OWNER
 * @property {RegExp} ExpReg
 * @property {Function} cmd
 */
module.exports = {
  active: true,
  OWNER: false,
  ExpReg: new RegExp(`^/start(?:@${configEnv.USERNAME_BOT})?$`, 'im'),
  async cmd (bot, msg) {
    const chatId = msg.chat.id
    bot.sendMessage(chatId, 'Hola, soy un bot🤖 , para empezar envia un enlace tiktok :)')
  }
}
