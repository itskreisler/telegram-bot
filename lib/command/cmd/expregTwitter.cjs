/* eslint-disable camelcase */

const { strip_html_tags } = require('../../helpers/Helpers.cjs')

const { apiTweetPik } = require('../../services/twitter.service.cjs')
const dummy = [
  {
    id: '1650110877868204032',
    name: 'KFC',
    handler: '@KFC_ES',
    avatarUrl: 'https://pbs.twimg.com/profile_images/1649100609813987329/IMUf_bmv.jpg',
    textHtml: '<span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0">elon nos ha pagado el verificado</span>',
    verified: true,
    url: 'https://twitter.com/KFC_ES/status/1650110877868204032',
    photos: [
      'https://pbs.twimg.com/media/FuZfGTHWwAI3Z_I?format=jpg&name=small'
    ],
    index: 0,
    likes: 4854,
    retweets: 232,
    replies: 0,
    quotes: 8
  }
]
module.exports = {
  active: true,
  ExpReg: /twitter\.com\/\w+\/status\/([0-9]+)/mi,
  async cmd (bot, content, match) {
    const quality = ['Low', 'Medium', 'High', 'Max']
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
      console.log(_e)
    } finally {
      deleteIsLoading()
    }

    console.log('es twitter')
  }
}
