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
  ExpReg: new RegExp(`^/start(?:@${configEnv.USERNAME_BOT})?`, 'im'),
  /**
   *
   * @param {import('node-telegram-bot-api')} bot
   * @param {import('node-telegram-bot-api').Message} msg
   */
  async cmd(bot, msg) {
    const chatId = msg.chat.id
    bot.sendMessage(chatId,
      `
Hola, soy un bot🤖 creado por @kreisler

Que puedo hacer:

- Envía un enlace de *tiktok* y te descargo el video o el album de fotos:
Ej: https://vm.tiktok.com/ZM26Y5Gw5/

- Envía un enlace de *youtube* y te descargo la musica:
Ej: https://www.youtube.com/watch?v=XXYlFuWEuKI

- Envía un enlace de tipo *foto de twitter* y te descargo la foto (Solo se admiten fotos) #Experimental
Ej: https://twitter.com/blaya_art/status/1665067725234876416?t=yap6sTo0mIjvtHSM_L2roA&s=35

Que puedo hacer con comandos:
- /start - Muestra este mensaje
- /donate - apoyame con una donacion :3
- /stickers - Envía un sticker y luego responde /stickers al sticker para descargar todos los stickers del pack
- /whatif - Puedes hacer preguntas, te respondere aleatoriamente
- /ping - Muestra el tiempo de respuesta del bot
- /uptime - Muestra el tiempo que el bot ha estado en linea
- /reload - (solo para el creador)
`, { parse_mode: 'Markdown' })
  }
}
