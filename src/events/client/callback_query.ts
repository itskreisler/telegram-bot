import { create } from 'youtube-dl-exec'
import fs from 'node:fs'
import { glob } from 'glob'
import { fetchAndSendStw, getStwCaption } from '../../helpers/stw.helper.js'
import { fetchAndSendClima, getClimaCaption } from '../../command/cmd/cmdClima.js'
import { downloadTrack, getTrackMetadata } from '../../services/tidal-instances.service.js'
import { sendPage } from '../../command/cmd/cmdTidal.js'
import { cron as cronScheduler, tasks as cronTasks } from '../../command/cmd/cmdCron.js'

const exec = create('yt-dlp')

export default async (client: any, callbackQuery: any) => {
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
      } catch (error: any) {
        await client.sendMessage(chatId, `❌ Error: ${error.message}`)
      }
      break
    case 'clima_refresh':
      try {
        const caption = getClimaCaption(params)
        await fetchAndSendClima(client, chatId, params, caption)
        await client.deleteMessage(chatId, messageId)
      } catch (error: any) {
        await client.sendMessage(chatId, `❌ Error: ${error.message}`)
      }
      break
    case 'tidal': {
      const tParts = data.split('|')
      const tAction = tParts[1]
      
      if (tAction === 'page') {
        const cacheKey = tParts[2]
        const page = parseInt(tParts[3], 10)
        try {
          await client.answerCallbackQuery(callbackQuery.id)
          await sendPage(client, chatId, cacheKey, page, messageId)
        } catch (error: any) {
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
        } catch (error: any) {
          await client.sendMessage(chatId, `❌ Error: ${error.message}`)
          await client.answerCallbackQuery(callbackQuery.id, { text: 'Error: ' + error.message, show_alert: true })
        }
        break
      }
      
      if (tAction === 'a' || tAction === 'al' || tAction === 'p' || tAction === 'v') {
        const searchQuery = decodeURIComponent(tParts[2])
        const input = tAction + ' ' + searchQuery
        const { cmd } = await import('../../command/cmd/cmdTidal.js')
        await client.answerCallbackQuery(callbackQuery.id)
        await cmd(client, { chat: { id: chatId } }, [null, input])
        break
      }
      
      await client.answerCallbackQuery(callbackQuery.id, { text: 'Botón no reconocido', show_alert: true })
      break
    }
    case 'cron_test': {
      const [_, name, targetChatId] = data.split('|')
      const task = cronTasks.get(name)
      if (!task) {
        await client.answerCallbackQuery(callbackQuery.id, { text: `Tarea "${name}" no encontrada`, show_alert: true })
        break
      }
      await client.answerCallbackQuery(callbackQuery.id, { text: `▶️ Ejecutando ${name}...` })
      try {
        await task.callback()
      } catch (err: any) {
        await client.sendMessage(parseInt(targetChatId, 10), `❌ Error en test *${name}*: ${err.message}`, { parse_mode: 'Markdown' })
      }
      break
    }
    case 'yt_video': {
      const videoUrl = params
      console.log('[YouTube] Mostrando selector de calidad para:', videoUrl)
      await client.answerCallbackQuery(callbackQuery.id)
      await client.sendMessage(chatId, 'Seleccioná calidad:', {
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [{ text: '🎥 360p', callback_data: 'yt_dl|' + videoUrl + '|360' }],
            [{ text: '🎥 720p', callback_data: 'yt_dl|' + videoUrl + '|720' }],
            [{ text: '🎥 1080p', callback_data: 'yt_dl|' + videoUrl + '|1080' }],
            [{ text: '🎥 Mejor calidad', callback_data: 'yt_dl|' + videoUrl + '|best' }]
          ]
        })
      })
      break
    }
    case 'yt_dl': {
      const [videoUrl, quality] = params.split('|')
      console.log('[YouTube] Descargando video:', { quality, videoUrl })
      await client.answerCallbackQuery(callbackQuery.id, { text: `🔄 Descargando ${quality}...` })
      const outputDir = '/tmp/yt_' + Date.now()
      fs.mkdirSync(outputDir, { recursive: true })
      try {
        const format = quality === 'best' ? 'best[ext=mp4]' : `bestvideo[height<=${quality}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${quality}][ext=mp4]`
        await exec(videoUrl, {
          format,
          output: `${outputDir}/%(title)s.%(ext)s`,
          noPlaylist: true,
          cookies: 'a.txt',
          jsRuntimes: 'deno',
          extractorArgs: 'youtube:player-client=default,-web_safari',
          remoteComponents: 'ejs:github'
        } as any)
        const [video] = await glob(`${outputDir}/*.{mp4,mkv,webm}`)
        if (video) {
          await client.sendVideo(chatId, video, { caption: `Video descargado desde YouTube (${quality})` })
          fs.rmSync(outputDir, { recursive: true })
        }
      } catch (err: any) {
        await client.sendMessage(chatId, `❌ Error al descargar video: ${err.message}`)
        if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true })
      }
      break
    }
    case 'cron_del': {
      const [_, name] = data.split('|')
      const task = cronTasks.get(name)
      if (!task) {
        await client.answerCallbackQuery(callbackQuery.id, { text: `Tarea "${name}" no encontrada`, show_alert: true })
        break
      }
      cronScheduler.destroyTask(name)
      cronTasks.delete(name)
      await client.answerCallbackQuery(callbackQuery.id, { text: `🗑 Tarea "${name}" eliminada` })
      await client.deleteMessage(chatId, messageId)
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
