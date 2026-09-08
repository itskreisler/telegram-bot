export const searchCache = new Map()

export function getCache(key: string) {
  return searchCache.get(key)
}

export async function sendPage(client: any, chatId: number | string, cacheKey: string, page: number, messageId?: number) {
  return client.sendMessage(chatId, `Página ${page}`)
}

export async function cmd(client: any, msg: any, match: any) {
  return client.sendMessage(msg.chat.id, 'Tidal command')
}

export default {
  searchCache,
  getCache,
  sendPage,
  cmd
}
