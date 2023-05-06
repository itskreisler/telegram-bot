/* eslint-disable camelcase */

const {
  validateDomainTikTok,
  ParseMode,
  abbreviateNumber,
  isNull,
  converterMb
} = require('../../helpers/Helpers.cjs')
const { apiTikWm } = require('../../services/tiktok.service.cjs')
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args))

const { success, error } = { success: 0, error: -1 }
const parse_mode = ParseMode.Markdown
const an = (_) => abbreviateNumber(_)
module.exports = {
  active: true,
  ExpReg:
    /(https?:\/\/((?:www\.)?|(?:vm\.)?|(?:m\.)?)tiktok\.com\/(?:@[a-zA-Z0-9_]+\/)?(?:video\/)?([a-zA-Z0-9]+))/im, // /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:((www|[a-zA-Z0-9]+).))?([^:\n?=]+)/,
  async cmd (bot, content, match) {
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
        // const photoData = await fetch(data.images[0]).then((res) => res.buffer())

        // return bot.sendPhoto(id, photoData, { caption: 'Aquí tienes tu foto' })
        if (code === success) {
          // 0=true, -1=false
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
          )} 🔁${an(share_count)} 📥${an(download_count)}_\n${
            isNull(title)
              ? `by [${unique_id}](https://www.tiktok.com/@${unique_id})`
              : `${title}\nby [${unique_id}](https://www.tiktok.com/@${unique_id})`
          }`
          if ('images' in data) {
            const { images } = data
            if (images.length < 2 || images.length > 10) {
              // FIXME: la url no se puede enviar como media group
              console.log('(?) Intentando enviar sendMediaGroupTenByTen'.rainbow)
              Promise.all([
                bot.sendMediaGroupTenByTen(
                  id,
                  images.map((media, i) => ({
                    type: 'photo',
                    media,
                    caption: `Photo ${i + 1}`
                  }))
                )
              ]).then(async () => {
                await bot.sendMessage(id, globalText, { parse_mode })
              }).catch(async () => {
                // si no se puede enviar como media group
                // se envia como fotos individuales
                console.log('(?) Intentando enviar sendPhoto'.rainbow)
                Promise.all([
                  images.map(async (media, i) => {
                    await bot.sendPhoto(id, await fetch(media).then((res) => res.buffer()), {
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
                  images.map((media, i) => ({
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
                  // si no se puede enviar como media group
                  // se envia como fotos individuales
                  console.log('(?) Intentando enviar sendPhoto'.rainbow)
                  Promise.all([
                    images.map(async (media, i) => {
                      await bot.sendPhoto(id, await fetch(media).then((res) => res.buffer()), {
                        caption: `Photo ${i + 1}`
                      })
                    })
                  ]).then(async () => {
                    await bot.sendMessage(id, globalText, { parse_mode })
                  })
                })
            }
          } else {
            const urlPLay = (str) => domain + data[str]
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
                      ? `${title} .${type} (${
                          isNull(data[size]) ? '' : converterMb(data[size])
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
                console.log('(?) Enviando cover'.rainbow)
                await bot.sendPhoto(id, urlPLay('cover'), {
                  caption: globalText,
                  reply_markup
                })
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
