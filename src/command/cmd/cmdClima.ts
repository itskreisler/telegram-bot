export function getClimaCaption(params: string): string {
  return `Clima para ${params}`
}

export async function fetchAndSendClima(client: any, chatId: number | string, params: string, caption?: string) {
  return client.sendMessage(chatId, caption || getClimaCaption(params))
}

export default {
  getClimaCaption,
  fetchAndSendClima
}
