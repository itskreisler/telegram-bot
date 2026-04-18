const LIMIT = 5

const searchCache = new Map()
const userCache = new Map()

function setCache(key, data) {
  searchCache.set(key, { ...data, createdAt: Date.now() })
}

function getCache(key) {
  return searchCache.get(key)
}

function setUserCache(chatId, cacheKey, query, type) {
  userCache.set(`u_${chatId}`, { cacheKey, query, type, createdAt: Date.now() })
}

function getUserCache(chatId) {
  return userCache.get(`u_${chatId}`)
}

function buildPageMessage(items, query, type, page) {
  const totalPages = Math.ceil(items.length / LIMIT)
  const start = page * LIMIT
  const pageItems = items.slice(start, start + LIMIT)

  let message = `🔍 "${query}" (${page + 1}/${totalPages})\n\n`

  pageItems.forEach((item, i) => {
    const num = start + i + 1
    if (type === 'track') {
      const duration = item.duration || 0
      const mins = Math.floor(duration / 60)
      const secs = duration % 60
      message += `${num}. 🎵 ${item.title}\n   👤 ${item.artist}\n   💿 ${item.album} [${mins}:${secs.toString().padStart(2, '0')}]\n`
    } else if (type === 'artist') {
      message += `${num}. 👤 ${item.name}\n`
    } else if (type === 'album') {
      message += `${num}. 💿 ${item.title}\n   👤 ${item.artist}\n`
    } else if (type === 'playlist') {
      message += `${num}. 📋 ${item.title}\n`
    } else if (type === 'video') {
      message += `${num}. 🎬 ${item.title}\n   👤 ${item.artist}\n`
    }
  })

  return { message, totalPages, pageItems, type, start }
}

function buildPaginationButtons(cacheKey, page, totalPages, pageItems, type, start) {
  const navButtons = []
  if (page > 0) {
    navButtons.push({ text: '⬅️', callback_data: `tidal|page|${cacheKey}|${page - 1}` })
  }
  if (page < totalPages - 1) {
    navButtons.push({ text: '➡️', callback_data: `tidal|page|${cacheKey}|${page + 1}` })
  }

  const rowButtons = pageItems.map((item, i) => {
    const num = start + i + 1
    if (type === 'track') {
      return { text: `${num}⬇️`, callback_data: `tidal|dl|${item.id}` }
    } else if (type === 'artist') {
      return { text: `${num}📥`, callback_data: `tidal|a|${encodeURIComponent(item.name)}` }
    } else if (type === 'album') {
      return { text: `${num}📥`, callback_data: `tidal|al|${encodeURIComponent(item.title)}` }
    } else if (type === 'playlist') {
      return { text: `${num}📥`, callback_data: `tidal|p|${encodeURIComponent(item.title)}` }
    } else if (type === 'video') {
      return { text: `${num}⬇️`, callback_data: `tidal|v|${item.id}` }
    }
    return null
  }).filter(Boolean)

  const keyboard = []
  for (let i = 0; i < rowButtons.length; i += 2) {
    keyboard.push(rowButtons.slice(i, i + 2))
  }
  if (navButtons.length > 0) {
    keyboard.push(navButtons)
  }

  return { inline_keyboard: keyboard }
}

module.exports = {
  LIMIT,
  searchCache,
  userCache,
  setCache,
  getCache,
  setUserCache,
  getUserCache,
  buildPageMessage,
  buildPaginationButtons
}