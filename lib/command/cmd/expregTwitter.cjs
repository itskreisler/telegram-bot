/* eslint-disable camelcase */

const { strip_html_tags } = require('../../helpers/Helpers.cjs')
const { apiTweetPik } = require('../../services/twitter.service.cjs')
module.exports = {
  active: true,
  ExpReg: /twitter\.com\/\w+\/status\/([0-9]+)/mi,
  async cmd (bot, content, match) {
    const {
      chat: { id },
      text
    } = content

    const isLoading = await bot.sendMessage(id, 'Enviando...')
    const deleteIsLoading = async () =>
      await bot.deleteMessage(id, isLoading.message_id)

    try {
      const { origin, pathname } = new URL(text)
      const res = await apiTweetPik(origin.concat(pathname))
      if (Array.isArray(res)) {
        console.log(res)
        const { photos, textHtml, handler } = res.shift()

        const globalTitle = strip_html_tags(textHtml).concat('\nby ', handler)
        const cantidad = photos.length
        switch (cantidad) {
          case 1:
            (() => {
              const [url] = photos
              bot.sendPhoto(id, url, {
                caption: globalTitle
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
              await bot.sendMessage(id, globalTitle)
            })
            break

          default:
            bot.sendMessage(id, 'Este tweet no tiene fotos\n\n'.concat(globalTitle))
            break
        }
      }
    } catch (_e) {
      bot.sendMessage(id, 'No se pudo enviar el tweet, intenta de nuevo mas tarde')
    } finally {
      deleteIsLoading()
    }
  }
}
