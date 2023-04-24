const { configEnv } = require('../../helpers/Helpers.cjs')

/**
 * @property {Boolean} active
 * @property {Boolean} OWNER
 * @property {RegExp} ExpReg
 * @property {Function} cmd
 */
module.exports = {
  active: true,
  OWNER: true,
  ExpReg: new RegExp(`^/start(?:@${configEnv.USERNAME_BOT})?$`, 'im'),
  async cmd (bot, msg) {
    const chatId = msg.chat.id
    bot.sendMessage(chatId, 'Hola, soy un bot🤖 , puedes usar los comandos /help o /comandos para ver los comandos disponibles.')
  }
}
