const STW_URL = 'https://stw-daily.vercel.app/api/v1/og.png'

const STW_REPLY_MARKUP = JSON.stringify({
  inline_keyboard: [
    [
      { text: '🔄 Actualizar', callback_data: 'stw_refresh' },
      { text: '🌐 Web', url: 'https://stw-daily.vercel.app' }
    ]
  ]
})

function getStwCaption() {
  const now = new Date().toLocaleString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  return `📅 *${now}*\nSTW Daily`
}

async function fetchAndSendStw(client, chatId, caption = null) {
  const response = await globalThis.fetch(STW_URL)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  return client.sendPhoto(chatId, buffer, { 
    caption: caption || getStwCaption(),
    reply_markup: STW_REPLY_MARKUP
  })
}

module.exports = { fetchAndSendStw, getStwCaption, STW_URL, STW_REPLY_MARKUP }
