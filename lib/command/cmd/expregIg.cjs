const { instaSuperSave } = require('../../services/ig.service.cjs')

module.exports = {
  active: true,
  ExpReg: /(?:https?:\/\/)?(?:www.)?instagram.com\/?([a-zA-Z0-9\\.\\_\\-]+)?\/([reel|p]+)?\/([a-zA-Z0-9\-\\_\\.]+)\/?([0-9]+)?/gm,
  /**
   * 
   * @param @param {import('../../core/Client.cjs')} bot
   * @param {*} body 
   */
  async cmd(bot, body) {
    const { chat: { id }, text: link } = body
    const isLoading = await bot.sendMessage(id, 'Enviando...')
    const deleteIsLoading = async () =>
      await bot.deleteMessage(id, isLoading.message_id)
    try {
      //const { video: media } = await instaVideoSave({ reel })
      //const [{ video }] = media
      //await bot.sendVideo(id, video)
      const inputMedia = await instaSuperSave({ link })
      let globalTitle = ''
      const cantidad = inputMedia.length
      const reply_markup = JSON.stringify({
        inline_keyboard: inputMedia.map((allMedia, i) => {
          const { url, meta: { title } } = allMedia;
          const [media] = url;
          globalTitle = title
          return [{
            text: `Media ${i + 1} de ${cantidad}`,
            url: new URL(media.url).searchParams.get('uri')
          }];
        })
      })
      if (cantidad === 1) {
        const [allMedia] = inputMedia
        const { url, meta: { title } } = allMedia
        const [media] = url
        await bot.sendDocument(id, media.url)
        await bot.sendMessage(id, title, { reply_markup })
        return
      }


      Promise.all([
        bot.sendDocumentOnebyOne(
          id,
          inputMedia.map((allMedia, i) => {
            const { url } = allMedia;
            const [media] = url;
            return media.url;
          })
        )
      ]).then(async () => {
        await bot.sendMessage(id, globalTitle, { reply_markup })
      })

    } catch (errorIG) {
      console.log({ errorIG })
      bot.sendMessage(id, 'A ocurrido un error, vuelve a intentarlo mas tarde')
    } finally {
      deleteIsLoading()
    }
  }
}
