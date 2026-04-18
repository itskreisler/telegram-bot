const { fetchAndSendStw, getStwCaption } = require('../../helpers/stw.helper.cjs')
const { fetchAndSendClima, getClimaCaption } = require('../../command/cmd/cmdClima.cjs')
const { downloadTrack, getTrackMetadata, getStreamInfo, getCoverUrl } = require('../../services/tidal-instances.service.cjs')
const { searchCache, getCache, sendPage } = require('../../command/cmd/cmdTidal.cjs')

/**
 * @param {import('node-telegram-bot-api')} client
 * @param {import('node-telegram-bot-api').CallbackQuery} callbackQuery
 */
module.exports = async (client, callbackQuery) => {
  const { data, message } = callbackQuery
  console.log('[CallbackQuery] Received:', data)

  const chatId = message?.chat?.id
  const messageId = message?.message_id

  if (!data || !chatId) {
    return client.answerCallbackQuery(callbackQuery.id)
  }

  const [action, ...rest] = data.split('|')
  console.log('[CallbackQuery] Action:', action, 'Rest:', rest)
  const params = rest.join('|')

console.log('[CallbackQuery] Switching on action:', action)
  console.log('[CallbackQuery] Testing tidal match:', action === 'tidal')
  switch (action) {
    case 'stw_refresh':
      console.log('[CallbackQuery] Matched stw_refresh')
      try {
        const caption = getStwCaption()
        await fetchAndSendStw(client, chatId, caption)
        await client.deleteMessage(chatId, messageId)
      } catch (error) {
        await client.sendMessage(chatId, `❌ Error: ${error.message}`)
      }
      break
    case 'clima_refresh':
      try {
        const caption = getClimaCaption(params)
        await fetchAndSendClima(client, chatId, params, caption)
        await client.deleteMessage(chatId, messageId)
      } catch (error) {
        await client.sendMessage(chatId, `❌ Error: ${error.message}`)
      }
      break
    case 'tidal': {
      const tParts = data.split('|')
      const tAction = tParts[1]
      
      if (tAction === 'page') {
        const cacheKey = tParts[2]
        const page = parseInt(tParts[3])
        try {
          await client.answerCallbackQuery(callbackQuery.id)
          await sendPage(client, chatId, cacheKey, page, messageId)
        } catch (error) {
          await client.sendMessage(chatId, `❌ Error: ${error.message}`)
        }
        break
      }
      
      if (tAction === 'dl') {
        const trackId = tParts[2]
        try {
          await client.answerCallbackQuery(callbackQuery.id, { text: '🔄 Descargando...', show_alert: false })
          const track = await getTrackMetadata(trackId)
          const outputPath = `/tmp/${(track.title || 'track').replace(/[^a-zA-Z0-9]/g, '_')}_${trackId}.flac`
          const savedPath = await downloadTrack(trackId, 'LOSSLESS', { outputPath })
          await client.sendAudio(chatId, savedPath, {
            caption: `🎵 ${track.title}\n👤 ${track.artist?.name || track.artists?.[0]?.name}\n💿 ${track.album?.title}`,
            parse_mode: 'HTML'
          })
        } catch (error) {
          await client.sendMessage(chatId, `❌ Error: ${error.message}`)
          await client.answerCallbackQuery(callbackQuery.id, { text: 'Error: ' + error.message, show_alert: true })
        }
        break
      }
      
      if (tAction === 'a' || tAction === 'al' || tAction === 'p' || tAction === 'v') {
        const searchQuery = decodeURIComponent(tParts[2])
        const input = tAction + ' ' + searchQuery
        const { cmd } = require('../../command/cmd/cmdTidal.cjs')
        await client.answerCallbackQuery(callbackQuery.id)
        await cmd.cmd(client, { chat: { id: chatId } }, [null, input])
        break
      }
      
      await client.answerCallbackQuery(callbackQuery.id, { text: 'Botón no reconocido', show_alert: true })
      break
      }
    default:
      client.answerCallbackQuery(callbackQuery.id, {
        text: 'Has presionado un botón',
        show_alert: true
      })
      break
  }

  client.answerCallbackQuery(callbackQuery.id)
}
