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

🎵 *YouTube* - Envía un link y descargo el *audio* automáticamente.
Tocá \`🎬 Descargar Video\` y elegí calidad (360p/720p/1080p/Best).

🎵 *TikTok* - Envía un link y descargo el *video* sin watermark.

🎵 *TIDAL* - Búsqueda inline con \`@meutilbot .q canción\` o con /tidal.

Comandos:
- /start - Este mensaje
- /tidal <id> - Descarga track de TIDAL
- /clima <ciudad> - Clima actual
- /donate - Donaciones
- /stickers - Descargar stickers
- /whatif - Preguntar a IA
- /ama - Preguntar a IA
- /ping - Tiempo de respuesta
- /uptime - Tiempo activo
- /cron - Tareas programadas
- /restart - (solo owner)
`, { parse_mode: 'Markdown' })
  }
}
