const { configEnv } = require('../../helpers/Helpers.cjs')
/**
 * @description Comando para donar al creador del bot
 *
 * @property {Boolean} active
 * @property {RegExp} ExpReg
 * @property {Function} cmd
 */
module.exports = {
  active: true,
  ExpReg: new RegExp(`^/donate(?:@${configEnv.USERNAME_BOT})?$`, 'im'),
  /**
   *
   * @param {import('../../core/Client.cjs')} bot
   * @param {import('node-telegram-bot-api').Message} msg
   */
  async cmd (bot, msg) {
    const { chat: { id: chatId } } = msg
    bot.sendMessage(chatId, 'Gracias por querer apoyarme, puedes hacerlo en el siguiente enlace:\n- *Paypal* [https://paypal.me/itskreisler](https://paypal.me/itskreisler)', { parse_mode: 'Markdown' })
  }
}
