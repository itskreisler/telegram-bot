import https from 'node:https'
import {
  validateDomainTikTok,
  ParseMode,
  abbreviateNumber,
  isNull,
  converterMb
} from '../../helpers/Helpers.js'
import { apiTikWm } from '../../services/tiktok.service.js'
import fetch from 'node-fetch'
import 'colors'

const { success, error } = { success: 0, error: -1 }
const parse_mode = ParseMode.Markdown
const an = (_: number) => abbreviateNumber(_)

export default {
  active: true,
  ExpReg: /(https?:\/\/((?:www\.)?|(?:vm\.)?|(?:vt\.)?|(?:m\.)?)tiktok\.com\/(?:@[a-zA-Z0-9_]+\/)?(?:video\/)?([a-zA-Z0-9]+))/im,
  async cmd(bot: any, content: any, match: any) {
    console.log('(¿) ------------------------------------------------- (?)'.rainbow)
    const {
      chat: { id }
    } = content
    const url = match.input
    if (validateDomainTikTok(url)) {
      const isLoading = await bot.sendMessage(id, 'Enviando...')
      const deleteIsLoading = async () =>
        await bot.deleteMessage(id, isLoading.message_id)
      try {
        const { code, msg, data, domain } = await apiTikWm(url)
        if (code === success) {
          const {
            play_count,
            digg_count,
            comment_count,
            share_count,
            download_count
          } = data
          const {
            title,
            author: { unique_id }
          } = data
          const globalText = `_ 👁️${an(play_count)} ❤️${an(digg_count)} 💬${an(
            comment_count
          )} 🔁${an(share_count)} 📥${an(download_count)}_\n${isNull(title)
            ? `by [${unique_id}](https://www.tiktok.com/@${unique_id})`
            : `${title}\nby [${unique_id}](https://www.tiktok.com/@${unique_id})`
            }`
          if ('images' in data) {
            const { images } = data
            if (images.length < 2 || images.length > 10) {
              console.log('(?) Intentando enviar sendMediaGroupTenByTen'.rainbow)
              Promise.all([
                bot.sendMediaGroupTenByTen(
                  id,
                  images.map((media: string, i: number) => ({
                    type: 'photo',
                    media,
                    caption: `Photo ${i + 1}`
                  }))
                )
              ]).then(async () => {
                await bot.sendMessage(id, globalText, { parse_mode })
              }).catch(async () => {
                console.log('(?) Intentando enviar sendPhoto'.rainbow)
                Promise.all([
                  images.map(async (media: string, i: number) => {
                    await bot.sendPhoto(id, await fetch(media).then((res: any) => res.buffer()), {
                      caption: `Photo ${i + 1}`
                    })
                  })
                ]).then(async () => {
                  await bot.sendMessage(id, globalText, { parse_mode })
                })
              })
            } else {
              console.log('(?) Intentando enviar sendMediaGroupTenByTen'.rainbow)
              Promise.all([
                bot.sendMediaGroup(
                  id,
                  images.map((media: string, i: number) => ({
                    type: 'photo',
                    media,
                    caption: `Photo ${i + 1}`
                  }))
                )
              ])
                .then(async () => {
                  await bot.sendMessage(id, globalText, { parse_mode })
                })
                .catch(async () => {
                  console.log('(?) Intentando enviar sendPhoto'.rainbow)
                  Promise.all([
                    images.map(async (media: string, i: number) => {
                      await bot.sendPhoto(id, await fetch(media).then((res: any) => res.buffer()), {
                        caption: `Photo ${i + 1}`
                      })
                    })
                  ]).then(async () => {
                    await bot.sendMessage(id, globalText, { parse_mode })
                  })
                })
            }
          } else {
            const urlPLay = (str: string) => domain + data[str]
            const btns = [
              {
                type: 'mp4',
                title: 'No Watermark',
                quality: 'play',
                size: 'size'
              },
              {
                type: 'mp4',
                title: 'No Watermark(HD)',
                quality: 'hdplay',
                size: 'hd_size'
              },
              {
                type: 'mp4',
                title: 'Watermark',
                quality: 'wmplay',
                size: 'wm_size'
              },
              {
                type: 'mp3',
                title: 'Music',
                quality: 'music',
                size: null
              },
              {
                type: 'webp',
                title: 'Cover',
                quality: 'cover',
                size: null
              }
            ]
            const reply_markup = JSON.stringify({
              inline_keyboard: btns.map(({ type, title, quality, size }) => [
                {
                  text:
                    type === 'mp4'
                      ? `${title} .${type} (${isNull(data[size!]) ? '' : converterMb(data[size!])
                      }MB)`
                      : `${title} .${type}`,
                  url: urlPLay(quality)
                }
              ])
            })
            try {
              console.log('(?) Intentando enviar hdplay'.rainbow)
              await bot.sendVideo(id, urlPLay('hdplay'), {
                caption: globalText,
                reply_markup,
                parse_mode
              })
            } catch (_error) {
              console.log('(X) hdplay ha fallado'.rainbow)
              try {
                console.log('(?) Intentando enviar play'.rainbow)
                await bot.sendVideo(id, urlPLay('play'), {
                  caption: globalText,
                  reply_markup
                })
              } catch (error) {
                console.log('(X) play ha fallado'.rainbow)
                console.log('(?) Intentando descargar y enviar por buffer'.rainbow)
                const descargarBuffer = (urlStr: string) => new Promise<Buffer>((resolve, reject) => {
                  https.get(urlStr, (res) => {
                    if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                      https.get(res.headers.location, (res2) => {
                        const chunks: any[] = []
                        res2.on('data', (chunk) => chunks.push(chunk))
                        res2.on('end', () => resolve(Buffer.concat(chunks)))
                      }).on('error', reject)
                      return
                    }
                    const chunks: any[] = []
                    res.on('data', (chunk) => chunks.push(chunk))
                    res.on('end', () => resolve(Buffer.concat(chunks)))
                  }).on('error', reject)
                })
                try {
                  const videoBuf = await descargarBuffer(urlPLay('hdplay'))
                  await bot.sendVideo(id, videoBuf, {
                    caption: globalText,
                    reply_markup,
                    parse_mode
                  })
                } catch (_e2) {
                  try {
                    const videoBuf = await descargarBuffer(urlPLay('play'))
                    await bot.sendVideo(id, videoBuf, {
                      caption: globalText,
                      reply_markup,
                      parse_mode
                    })
                  } catch (_e3) {
                    console.log('(?) Enviando cover'.rainbow)
                    try {
                      await bot.sendPhoto(id, urlPLay('cover'), {
                        caption: globalText,
                        reply_markup
                      })
                    } catch (e) {
                      console.log('(X) cover ha fallado'.rainbow)
                      console.log('(?) Enviando BUFFER'.rainbow)
                      const buffer = await descargarBuffer(urlPLay('cover'))
                      await bot.sendPhoto(id, buffer, {
                        caption: globalText,
                        reply_markup
                      })
                    }
                  }
                }
              }
            }
          }
        }
        if (code === error) {
          bot.sendMessage(id, `_${msg}_`, { parse_mode })
        }
      } catch (e) {
        console.log(`ExpRegTikTok: ${e}`.red)
      } finally {
        deleteIsLoading()
      }
    }
  }
}
