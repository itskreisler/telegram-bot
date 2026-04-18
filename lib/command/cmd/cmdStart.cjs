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
Ej: \`https://www.tiktok.com/@itskreisler/video/7186771164595834118\`

- Envía un enlace de *youtube* y te descargo la musica:
Ej: \`https://www.youtube.com/watch?v=XXlFuWEuKI\`

- Envía un enlace de tipo *foto de twitter* y te descargo la foto (Solo se admiten fotos) #Experimental
Ej: \`https://twitter.com/blaya_art/status/1665067725234876416\`

- *Búsqueda inline* - Escribe \`@meutilbot .q nombre de canción\` y selecciona el resultado
- *Descargar* - Descarga el audio en FLAC desde TIDAL

Comandos:
- /start - Muestra este mensaje
- /tidal <id> - Descarga track de TIDAL por ID
- /clima <ciudad> - Clima actual
- /donate - apoyame con una donacion :3
- /stickers - Envía un sticker y luego responde /stickers al sticker para descargar todos los stickers del pack
- /whatif - Puedes hacer preguntas, te respondere aleatoriamente
- /ping - Muestra el tiempo de respuesta del bot
- /uptime - Muestra el tiempo que el bot ha estado en linea
- /reload - (solo para el creador)
`, { parse_mode: 'Markdown' })
  }
}
