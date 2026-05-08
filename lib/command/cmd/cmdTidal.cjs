const { configEnv } = require('../../helpers/Helpers.cjs')
const { downloadTrack, getTrackMetadata, searchTracks, searchArtists, searchAlbums, searchPlaylists, searchVideos } = require('../../services/tidal-instances.service.cjs')
const { setCache, getCache, setUserCache, buildPageMessage, buildPaginationButtons } = require('../../helpers/tidal-pagination.cjs')

const LIMIT = 5

const SEARCH_TYPES = {
  q: { name: 'tracks', searchFn: searchTracks, type: 'track' },
  s: { name: 'tracks', searchFn: searchTracks, type: 'track' },
  a: { name: 'artists', searchFn: searchArtists, type: 'artist' },
  al: { name: 'albums', searchFn: searchAlbums, type: 'album' },
  p: { name: 'playlists', searchFn: searchPlaylists, type: 'playlist' },
  v: { name: 'videos', searchFn: searchVideos, type: 'video' }
}

async function cmd (bot, msg, args) {
  console.log('[TIDAL] CALLED args:', JSON.stringify(args))
  const chatId = msg.chat.id
  const input = args?.[1]?.trim() || ''

  if (!input) {
    bot.sendMessage(chatId, `🎵 TIDAL Bot\n\n📖 Uso:\n/tidal 123456 - Descargar\n/tidal q shakira - Buscar\n\n🔍 Inline: @meutilbot q shakira`)
    return
  }

  if (/^\d+$/.test(input)) {
    await downloadById(bot, chatId, input)
    return
  }

  let searchType = SEARCH_TYPES.q
  let query = input

  const prefixMatch = input.match(/^\.?(al|[qspav])\s+(.+)$/i)
  if (prefixMatch) {
    const key = prefixMatch[1].toLowerCase()
    if (SEARCH_TYPES[key]) {
      searchType = SEARCH_TYPES[key]
      query = prefixMatch[2].trim()
    }
  }

  try {
    bot.sendMessage(chatId, `🔍 Buscando: "${query}"...`)
    const items = await searchType.searchFn(query)

    if (!items || items.length === 0) {
      bot.sendMessage(chatId, `❌ Sin resultados para "${query}"`)
      return
    }

    const cacheKey = `s_${Date.now()}_${Math.random().toString(36).slice(2)}`
    setCache(cacheKey, { items, query, type: searchType.type })
    setUserCache(chatId, cacheKey, query, searchType.type)

    await sendPage(bot, chatId, cacheKey, 0)
  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`)
  }
}

async function sendPage(bot, chatId, cacheKey, page, messageId = null) {
  const cached = getCache(cacheKey)
  if (!cached) {
    bot.sendMessage(chatId, '❌ Búsqueda expirada. Haz /tidal q tu_busqueda')
    return
  }

  const { items, query, type } = cached
  const { message, totalPages, pageItems, type: itemType, start } = buildPageMessage(items, query, type, page)
  const replyMarkup = buildPaginationButtons(cacheKey, page, totalPages, pageItems, itemType, start)

  try {
    if (messageId) {
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: replyMarkup
      })
    } else {
      await bot.sendMessage(chatId, message, { reply_markup: replyMarkup })
    }
  } catch {
    try {
      await bot.sendMessage(chatId, message, { reply_markup: replyMarkup })
    } catch {
      await bot.sendMessage(chatId, message)
    }
  }
}

async function downloadById(bot, chatId, trackId) {
  let statusMsg1 = null
  let statusMsg2 = null
  try {
    statusMsg1 = await bot.sendMessage(chatId, '🔄 Buscando...')
    const track = await getTrackMetadata(trackId)
    const duration = track.duration
    const mins = Math.floor(duration / 60)
    const secs = duration % 60
    await bot.sendMessage(chatId, `🎵 ${track.title}\n👤 ${track.artist?.name}\n💿 ${track.album?.title}\n⏱ ${mins}:${secs.toString().padStart(2, '0')}`)

    statusMsg2 = await bot.sendMessage(chatId, '⏬ Descargando (FLAC)...')
    const filename = (track.title || 'track').replace(/[^a-zA-Z0-9]/g, '_')
    const outputPath = `/tmp/${filename}_${trackId}.flac`
    const savedPath = await downloadTrack(trackId, 'LOSSLESS', { outputPath })

    await bot.sendAudio(chatId, savedPath, {
      caption: `🎵 ${track.title}\n👤 ${track.artist?.name}\n💿 ${track.album?.title}`,
      parse_mode: 'HTML'
    })
    console.log(`[TIDAL] Audio sent: ${track.title} - ${trackId}`)
  } catch (error) {
    console.error(`[TIDAL] Download error for ${trackId}:`, error.message)
    await bot.sendMessage(chatId, `❌ Error: ${error.message}`)
  } finally {
    for (const msg of [statusMsg1, statusMsg2]) {
      if (msg) {
        try { await bot.deleteMessage(chatId, msg.message_id) } catch {}
      }
    }
  }
}

module.exports = {
  active: true,
  ExpReg: new RegExp(`^(?:@${configEnv.USERNAME_BOT}\\s*)?/tidal(?:@${configEnv.USERNAME_BOT})?(?:\\s+(.+))?$`, 'im'),
  cmd,
  sendPage
}