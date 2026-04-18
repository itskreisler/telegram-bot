const { configEnv } = require('../../helpers/Helpers.cjs')

const WTTR_URL = 'https://wttr.in'

function getClimaCaption(query) {
  const now = new Date().toLocaleString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  return `📅 *${now}*\nClima: ${query}`
}

const CLIMA_REPLY_MARKUP = (query) => JSON.stringify({
  inline_keyboard: [
    [
      { text: '🔄 Actualizar', callback_data: `clima_refresh|${query}` },
      { text: '🌐 Web', url: `https://wttr.in/${encodeURIComponent(query)}` }
    ]
  ]
})

async function fetchAndSendClima(client, chatId, query, caption = null) {
  const url = `${WTTR_URL}/${encodeURIComponent(query)}.png?m&lang=es`
  const response = await globalThis.fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  return client.sendPhoto(chatId, buffer, { 
    caption: caption || getClimaCaption(query),
    reply_markup: CLIMA_REPLY_MARKUP(query)
  })
}

module.exports = {
  active: true,
  OWNER: false,
  ExpReg: new RegExp(`^/clima(?:@${configEnv.USERNAME_BOT})?\\s+(.+)$`, 'im'),
  async cmd(bot, msg, match) {
    const chatId = msg.chat.id
    const query = match?.[1]?.trim()
    
    if (!query || query.length < 2) {
      return bot.sendMessage(chatId, 'Uso: /clima <ciudad>\nEjemplo: /clima Madrid')
    }
    
    const loading = await bot.sendMessage(chatId, '⏳ Obteniendo clima...')
    
    try {
      const caption = getClimaCaption(query)
      await fetchAndSendClima(bot, chatId, query, caption)
      await bot.deleteMessage(chatId, loading.message_id)
    } catch (error) {
      await bot.editMessageText(`❌ Error: ${error.message}`, {
        chat_id: chatId,
        message_id: loading.message_id
      })
    }
  }
}

module.exports.fetchAndSendClima = fetchAndSendClima
module.exports.getClimaCaption = getClimaCaption
module.exports.CLIMA_REPLY_MARKUP = CLIMA_REPLY_MARKUP