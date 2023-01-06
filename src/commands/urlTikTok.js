import { bot } from '../bot.js'
import { validateDomain } from '../validateDomain.js'
import { tiktokDl } from '../tiktokDl.js'

const cmdUrlTikTokRegExp =
  /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:((www|[a-zA-Z0-9]+).))?([^:\n?=]+)/

/**
 * Convierta un tamaño en bytes a megabytes y devuelva una cadena con dos decimales.
 * @param {number} size
 * @return {string}
 */
const converterMb = (size) => (size / 1024 / 1024).toFixed(2)
async function sendMediaGroup (chatId, images) {
  // Divide las imágenes en grupos de 10
  const chunkedImages = images.reduce((acc, cur, i) => {
    if (i % 10 === 0) {
      acc.push([cur])
    } else {
      acc[acc.length - 1].push(cur)
    }
    return acc
  }, [])

  // Envía cada grupo de 10 imágenes
  for (const chunk of chunkedImages) {
    await bot.sendMediaGroup(chatId, chunk)
  }
}

const cmdUrlTikTokFn = async (msg, math) => {
  const chatId = msg.chat.id
  const url = math.input

  if (validateDomain(url)) {
    await tiktokDl(url, async (x) => {
      if (!x.code) {
        const isLoading = await bot.sendMessage(chatId, 'Enviando...')
        const deleteIsLoading = async () => await bot.deleteMessage(chatId, isLoading.message_id)

        const globalTitle =
          x.data.title == null
            ? `by @${x.data.author.unique_id}`
            : `${x.data.title}\nby @${x.data.author.unique_id}`

        if ('images' in x.data) {
          try {
            if (x.data.images.length < 2 || x.data.images.length > 10) {
              /* Promise.all(
                x.data.images.map((_, i) =>
                  bot.sendPhoto(chatId, _, {
                    caption: `img ${i}`
                  })
                )
              ).then(() => {
                bot.sendMessage(chatId, globalTitle)
              }) */
              Promise.all([
                sendMediaGroup(
                  chatId,
                  x.data.images.map((media, i) => ({
                    type: 'photo',
                    media,
                    caption: `img ${i}`
                  }))
                )
              ]).then(async () => {
                await bot.sendMessage(chatId, globalTitle)
              })
            } else {
              Promise.all([
                bot.sendMediaGroup(
                  chatId,
                  x.data.images.map((media, i) => ({
                    type: 'photo',
                    media,
                    caption: `img ${i}`
                  }))
                )
              ]).then(async () => {
                await bot.sendMessage(chatId, globalTitle)
              })
            }
          } catch (_error) {
            bot.sendMessage(
              chatId,
              'Ocurrio un error al enviar las imagenes.\nVuelve a intentarlo más tarde. :)'
            )
          } finally {
            deleteIsLoading()
          }
        } else {
          const urlPLay = (str) => x.domain + x.data[str]
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
            }
          ]
          const replyMarkupVideo = JSON.stringify({
            inline_keyboard: btns.map(({ type, title, quality, size }) => [
              {
                text:
                  type === 'mp4'
                    ? `${title} .${type} (${converterMb(x.data[size])}MB)`
                    : `${title} .${type}`,
                url: urlPLay(quality)
              }
            ])
          })
          try {
            await bot.sendVideo(chatId, urlPLay('hdplay'), {
              caption: globalTitle,
              reply_markup: replyMarkupVideo
            })
          } catch (_error) {
            try {
              await bot.sendVideo(chatId, urlPLay('play'), {
                caption: globalTitle,
                reply_markup: replyMarkupVideo
              })
            } catch (error) {
              await bot.sendPhoto(chatId, urlPLay('cover'), {
                caption: globalTitle,
                reply_markup: replyMarkupVideo
              })
            }
          } finally {
            deleteIsLoading()
          }
        }
      } else {
        bot.sendMessage(chatId, x.msg)
      }
    })
    // bot.sendMessage(chatId, JSON.stringify(x));
  }
}

export { cmdUrlTikTokFn, cmdUrlTikTokRegExp }
