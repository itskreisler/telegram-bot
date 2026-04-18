const { searchTracks, searchArtists, searchAlbums, searchPlaylists, searchVideos, getStreamInfo, getCoverUrl, downloadTrack, getTrackMetadata } = require('../../services/tidal-instances.service.cjs')

const SEARCH_TYPES = {
  q: { name: 'all', title: '🎵 everything', searchFn: searchTracks, type: 'track', slice: 20 },
  s: { name: 'tracks', title: '🎵 tracks', searchFn: searchTracks, type: 'track', slice: 40 },
  a: { name: 'artists', title: '👤 artists', searchFn: searchArtists, type: 'artist', slice: 30 },
  al: { name: 'albums', title: '💿 albums', searchFn: searchAlbums, type: 'album', slice: 20 },
  p: { name: 'playlists', title: '📋 playlists', searchFn: searchPlaylists, type: 'playlist', slice: 20 },
  v: { name: 'videos', title: '🎬 videos', searchFn: searchVideos, type: 'video', slice: 20 }
}

module.exports = async (bot, msg) => {
  const { id, query } = msg

  if (!query || query.trim().length === 0) return

  const trimmed = query.trim()
  let cleanQuery = trimmed
  let searchType = SEARCH_TYPES.q
  let isDownload = false

  if (trimmed.startsWith('.d ') || trimmed.startsWith('.download ')) {
    isDownload = true
    cleanQuery = trimmed.slice(trimmed.startsWith('.download ') ? 10 : 3).trim()
  } else if (trimmed.startsWith('.') || trimmed.startsWith('q')) {
    const match = trimmed.match(/^[.q]([qsapv]|al)?(?:\s+(.*))?$/i)
    if (match) {
      const key = (match[1] || 'q').toLowerCase()
      if (SEARCH_TYPES[key]) {
        searchType = SEARCH_TYPES[key]
        cleanQuery = match[2] ? match[2].trim() : ''
      }
    }
  }

  if (!cleanQuery) {
    cleanQuery = trimmed
  }

  if (cleanQuery.length === 0) {
    await bot.answerInlineQuery(id, [{
      type: 'article',
      id: 'help',
      title: 'Buscar música',
      description: 'q o .q + búsqueda',
      input_message_content: { message_text: '📖 Ejemplos:\nq shakira\n.q rock\n.s tracks\n.a artists' }
    }], { cache_time: 3600 })
    return
  }

  try {
    if (isDownload) {
      await downloadTrack(cleanQuery, 'LOSSLESS', { outputPath: `/tmp/tidal_${cleanQuery}.flac` })
      await bot.answerInlineQuery(id, [{
        type: 'article',
        id: 'download',
        title: 'Descargar',
        description: `Track ID: ${cleanQuery}`,
        input_message_content: { message_text: `Descargando track ${cleanQuery}...` }
      }], { cache_time: 1 })
      return
    }

    console.log('[InlineQuery] Type:', searchType.name, 'Query:', cleanQuery)
    const items = await searchType.searchFn(cleanQuery)
    const slice = searchType.slice

    if (!items || items.length === 0) {
      await bot.answerInlineQuery(id, [{
        type: 'article',
        id: 'no-results',
        title: 'Sin resultados',
        description: `No se encontró "${cleanQuery}"`,
        input_message_content: { message_text: `Sin resultados para "${cleanQuery}"` }
      }], { cache_time: 300 })
      return
    }

    const results = await Promise.all(items.slice(0, slice).map(async (item) => {
      if (searchType.type === 'track') {
        const coverUrl = getCoverUrl(item.albumCover || item.albumId, '160')
        const duration = item.duration || 0
        const mins = Math.floor(duration / 60)
        const secs = duration % 60
        const durationStr = `${mins}:${secs.toString().padStart(2, '0')}`

        return {
          type: 'article',
          id: String(item.id),
          title: item.title,
          description: `${item.artist} • ${item.album} [${durationStr}]`,
          thumb_url: coverUrl,
          input_message_content: {
            message_text: `/tidal ${item.id}`,
            parse_mode: 'Markdown'
          },
          reply_markup: {
            inline_keyboard: [
              [{ text: '⬇️ Descargar', switch_inline_query_current_chat: `/tidal ${item.id}` }]
            ]
          }
        }
      } else if (searchType.type === 'artist') {
        return {
          type: 'article',
          id: String(item.id),
          title: item.name,
          description: `👤 Artista`,
          thumb_url: item.picture ? `https://resources.tidal.com/images/${item.picture}/160x160.jpg` : undefined,
          input_message_content: { message_text: `👤 ${item.name}` }
        }
      } else if (searchType.type === 'album') {
        return {
          type: 'article',
          id: String(item.id),
          title: item.title,
          description: `${item.artist} • Álbum`,
          thumb_url: item.cover ? `https://resources.tidal.com/images/${item.cover}/160x160.jpg` : undefined,
          input_message_content: { message_text: `💿 ${item.title}\n👤 ${item.artist}` }
        }
      } else if (searchType.type === 'playlist') {
        return {
          type: 'article',
          id: String(item.id),
          title: item.title,
          description: `📋 by ${item.creator || 'Unknown'}`,
          thumb_url: item.cover ? `https://resources.tidal.com/images/${item.cover}/160x160.jpg` : undefined,
          input_message_content: { message_text: `📋 ${item.title}` }
        }
      } else if (searchType.type === 'video') {
        return {
          type: 'article',
          id: String(item.id),
          title: item.title,
          description: `${item.artist} • Video`,
          thumb_url: item.cover ? `https://resources.tidal.com/images/${item.cover}/160x160.jpg` : undefined,
          input_message_content: { message_text: `🎬 ${item.title}\n👤 ${item.artist}` }
        }
      }
      return null
    }))

    const validResults = results.filter(r => r !== null)

    await bot.answerInlineQuery(id, validResults, {
      cache_time: 600,
      switch_pm_text: 'Ayuda',
      switch_pm_parameter: 'help'
    })
  } catch (err) {
    console.error('[InlineQuery] Error:', err.message)
    await bot.answerInlineQuery(id, [{
      type: 'article',
      id: 'error',
      title: 'Error',
      description: 'Error al buscar',
      input_message_content: { message_text: 'Error al buscar en TIDAL' }
    }], { cache_time: 1 })
  }
}