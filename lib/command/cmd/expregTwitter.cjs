const { strip_html_tags: stripHtmlTags } = require('../../helpers/Helpers.cjs')
const {
  apiTweetPik,
  glavierApiTwitter
} = require('../../services/twitter.service.cjs')

/**
 * Constantes para tipos de medios
 * @readonly
 * @enum {string}
 */
const MEDIA_TYPE = {
  PHOTO: 'photo',
  VIDEO: 'video'
}

const { PHOTO, VIDEO } = MEDIA_TYPE

/**
 * Comando para procesar enlaces de Twitter/X y descargar fotos/videos
 * @module expregTwitter
 */
module.exports = {
  /** @type {boolean} */
  active: true,
  
  /** @type {RegExp} */
  ExpReg: /(x|twitter)\.com\/\w+\/status\/([0-9]+)/im,
  
  /**
   * Ejecuta el comando de descarga de tweets
   * @param {import('node-telegram-bot-api')} bot - Instancia del bot de Telegram
   * @param {import('node-telegram-bot-api').Message} content - Mensaje recibido
   * @param {RegExpMatchArray} match - Resultado de la expresión regular
   * @returns {Promise<void>}
   */
  async cmd(bot, content, match) {
    const {
      chat: { id },
      text
    } = content
    const [_text, _xotwitter, idTweet] = match
    const isLoading = await bot.sendMessage(id, 'Enviando...')
    const deleteIsLoading = async () =>
      await bot.deleteMessage(id, isLoading.message_id)

    try {
      const { origin, pathname } = new URL(text)
      const newOrigin = origin.replace('x', 'twitter')
      const res = await apiTweetPik(newOrigin.concat(pathname))
      if (Array.isArray(res)) {
        const { photos, textHtml, handler } = res.shift()

        const globalTitle = stripHtmlTags(textHtml).concat('\nby ', handler)
        const cantidad = photos.length
        const options = {
          reply_markup: JSON.stringify({
            inline_keyboard: photos.map((url, i) => [
              {
                text: `Photo ${i + 1}`,
                url
              }
            ])
          })
        }
        switch (cantidad) {
          case 1:
            (() => {
              const [url] = photos
              bot.sendPhoto(id, url, {
                caption: globalTitle,
                reply_markup: options.reply_markup
              })
            })()
            break
          case 2:
          case 3:
          case 4:
            Promise.all([
              bot.sendMediaGroupTenByTen(
                id,
                photos.map((item, i) => {
                  const q = new URLSearchParams({ format: 'png' }).toString()
                  const { origin, pathname } = new URL(item)
                  const media = origin.concat(pathname, '?', q)
                  return {
                    type: 'photo',
                    media,
                    caption: `Photo ${i + 1} de ${cantidad}`
                  }
                })
              )
            ]).then(async () => {
              await bot.sendMessage(id, globalTitle, options)
            })
            break

          default:
            bot.sendMessage(
              id,
              'Este tweet no tiene fotos.\n\n'.concat(globalTitle)
            )
            break
        }
      }
    } catch (e) {
      try {
        const { mediaVideo, fullText } = await glavierApiTwitter({
          id: idTweet,
          useCache: true
        })
        const cant = mediaVideo.length
        const options = {
          reply_markup: JSON.stringify({
            inline_keyboard: mediaVideo.map(({ media_url_https: url }, i) => [
              {
                text: `Photo ${i + 1}`,
                url
              }
            ])
          })
        }
        switch (cant) {
          case 1:
            (() => {
              const [url] = mediaVideo
              const { media_url_https: mediaUrlHttps, type } = url
              if (type === PHOTO) {
                bot.sendPhoto(id, mediaUrlHttps, {
                  caption: fullText,
                  reply_markup: options.reply_markup
                })
              }
              if (type === VIDEO) {
                const { video_info: { variants } } = url
                const buttonsVideo = JSON.stringify({
                  inline_keyboard: variants.filter(({ content_type: contentType }) => contentType === 'video/mp4').map(({ url }, i) => [
                    {
                      text: `Variant ${i + 1}`,
                      url
                    }
                  ])
                })
                bot.sendPhoto(id, mediaUrlHttps, {
                  caption: fullText,
                  reply_markup: buttonsVideo
                })
              }
            })()
            break
          case 2:
          case 3:
          case 4:
            (() => {
              const imagenes = mediaVideo.map(({ media_url_https: mediaUrlHttps }, i) => ({
                type: PHOTO,
                media: mediaUrlHttps,
                caption: `Photo ${i + 1} de ${cant}`
              }))
              bot.sendMediaGroup(id, imagenes)
            })()
            break

          default:
            bot.sendMessage(
              id,
              'Este tweet no tiene fotos\n\n'.concat(fullText)
            )
            break
        }
      } catch (error) {
        bot.sendMessage(
          id,
          'No se pudo enviar el tweet, intenta de nuevo mas tarde'
        )
      }
    } finally {
      deleteIsLoading()
    }
  }
}
