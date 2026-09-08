import { InputFile, type ChatId, type InlineKeyboardMarkup, type SendPhotoResult } from 'node-telegram-bot-api'
import type { ClientBot } from '../core/main.js'

export const STW_URL = 'https://stw-daily.vercel.app/api/v1/og.png'

export const STW_REPLY_MARKUP: InlineKeyboardMarkup = {
  inline_keyboard: [[
    { text: 'Actualizar', callback_data: 'stw_refresh' },
    { text: 'Web', url: 'https://stw-daily.vercel.app' }
  ]]
}

export function getStwCaption(): string {
  const now = new Date().toLocaleString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  return `*${now}*\nSTW Daily`
}

export async function fetchAndSendStw(client: ClientBot, chatId: ChatId, caption = getStwCaption()): Promise<SendPhotoResult> {
  const response = await fetch(STW_URL)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const file = new InputFile(new Uint8Array(await response.arrayBuffer()), { filename: 'stw.png' })
  return await client.api.sendPhoto({
    chat_id: chatId,
    photo: file,
    caption,
    reply_markup: STW_REPLY_MARKUP
  })
}
