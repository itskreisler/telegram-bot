const { configEnv } = require('../../helpers/Helpers.cjs')

async function googleSearch(query) {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
  const response = await fetch(url)
  const data = await response.json()
  
  return (data.RelatedTopics || []).slice(0, 10).map(t => ({
    title: t.Text,
    link: t.FirstURL || ''
  }))
}

module.exports = {
  active: false,
  ExpReg: new RegExp(`^/google(?:@${configEnv.USERNAME_BOT})?\\s+(.+)$`, 'im'),
  async cmd(bot, msg, match) {
    const chatId = msg.chat.id
    const query = match?.[1]?.trim()
    
    if (!query) {
      return bot.sendMessage(chatId, 'Uso: /google <búsqueda>\nEjemplo: /google clima bogotá')
    }
    
    const loading = await bot.sendMessage(chatId, '🔍 Buscando...')
    
    try {
      const results = await googleSearch(query)
      
      if (results.length === 0) {
        return bot.editMessageText('❌ Sin resultados', {
          chat_id: chatId,
          message_id: loading.message_id
        })
      }
      
      let message = `🔍 Resultados para: ${query}\n\n`
      results.forEach((r, i) => {
        message += `${i + 1}. ${r.title}\n🔗 ${r.link}\n\n`
      })
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: loading.message_id
      })
    } catch (error) {
      await bot.editMessageText(`❌ Error: ${error.message}`, {
        chat_id: chatId,
        message_id: loading.message_id
      })
    }
  }
}