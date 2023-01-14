import { bot } from '../bot.js'
import { sendMediaGroup } from '../helpers.js'
import { twDl, twDlVideo } from '../twDl.js'
import 'colors'
export const cmdTwitterRegExp = /twitter\.com\/\w+\/status\/([0-9]+)/g

export const cmdTwitterFn = async (msg, match) => {
  const quality = ['Low', 'Medium', 'High', 'Max']
  const {
    chat: { id },
    text
  } = msg
  const [, q] = match
  const isLoading = await bot.sendMessage(id, 'Enviando...')
  const deleteIsLoading = async () =>
    await bot.deleteMessage(id, isLoading.message_id)

  try {
    const res = await twDl(q)

    const globalTitle = `${res.text.replace(/http(s?):\/\/t\.co\/([\w]+)/g, '')}\nby @${res.username}`
    if ('media' in res && res.media.every(({ type }) => type === 'photo')) {
      if (res.media.length === 1) {
        const [{ url }] = res.media
        bot.sendPhoto(id, url, {
          caption: globalTitle
        })
      } else if (res.media.length < 2 || res.media.length > 10) {
        Promise.all([
          sendMediaGroup(
            id,
            res.media.map(({ url, type }, i) => ({
              type,
              media: url,
              caption: `img ${i}`
            }))
          )
        ]).then(async () => {
          await bot.sendMessage(id, globalTitle)
        })
      } else {
        Promise.all([
          bot.sendMediaGroup(
            id,
            res.media.map(({ url, type }, i) => ({
              type,
              media: url,
              caption: `img ${i}`
            }))
          )
        ]).then(async () => {
          await bot.sendMessage(id, globalTitle)
        })
      }
    } else if ('media' in res && res.media.every(({ type }) => type === 'video')) {
      const resvideo = await twDlVideo(q)

      const options = {
        reply_markup: JSON.stringify({
          inline_keyboard: resvideo.variants.map(({ bitrate, url }, i) => [
            {
              text: `bitrate: ${bitrate}\n${quality[i]} quality`,
              url
            }
          ])
        })
      }

      try {
        const { url } = resvideo.variants.pop()
        Promise.all([bot.sendVideo(id, url)]).then(() => {
          bot.sendMessage(id, globalTitle)
        }).catch(() => {
          const { url } = resvideo.variants.shift()
          Promise.all([bot.sendVideo(id, url)]).catch(() => {
            console.log('(catch) #0'.red)
            bot.sendMessage(id, 'Seleciona la calidad del video', options)
          })
        })
      } catch (error) {
        console.log('(catch) #1'.red)
      } finally {
        console.log('(finally)'.blue)
      }
    } else if ('quote' in res) {
      const quote = await twDl(res.quote.id)
      if ('media' in quote && quote.media.every(({ type }) => type === 'photo')) {
        if (quote.media.length === 1) {
          const [{ url }] = quote.media
          bot.sendPhoto(id, url, {
            caption: globalTitle
          })
        } else if (quote.media.length < 2 || quote.media.length > 10) {
          Promise.all([
            sendMediaGroup(
              id,
              quote.media.map(({ url, type }, i) => ({
                type,
                media: url,
                caption: `img ${i}`
              }))
            )
          ]).then(async () => {
            await bot.sendMessage(id, globalTitle)
          })
        } else {
          Promise.all([
            bot.sendMediaGroup(
              id,
              quote.media.map(({ url, type }, i) => ({
                type,
                media: url,
                caption: `img ${i}`
              }))
            )
          ]).then(async () => {
            await bot.sendMessage(id, globalTitle)
          })
        }
      } else if ('media' in quote && quote.media.every(({ type }) => type === 'video')) {
        const resvideo = await twDlVideo(quote.id)
        const options = {
          reply_markup: JSON.stringify({
            inline_keyboard: resvideo.variants.map(({ bitrate, url }, i) => [
              {
                text: `bitrate: ${bitrate}\n${quality[i]} quality`,
                url
              }
            ])
          })
        }

        try {
          const { url } = resvideo.variants.pop()
          Promise.all([bot.sendVideo(id, url)]).then(() => {
            bot.sendMessage(id, globalTitle)
          }).catch(() => {
            const { url } = resvideo.variants.shift()
            Promise.all([bot.sendVideo(id, url)]).catch(() => {
              console.log('(catch) #0'.red)
              bot.sendMessage(id, 'Seleciona la calidad del video', options)
            })
          })
        } catch (error) {
          console.log('(catch) #1'.red)
        } finally {
          console.log('(finally)'.blue)
        }
      }
    }
  } catch (e) {
    console.log(`(catch) ${e}`.red)
    console.log('(catch) #2'.red)
    bot.sendMessage(id, `url invalid:\n\`${text}\``, {
      parse_mode: 'Markdown'
    })
  } finally {
    deleteIsLoading()
  }
}
