const { instaVideoSave } = require('../../services/ig.service.cjs')

module.exports = {
  active: false,
  ExpReg: /(?:https?:\/\/)?(?:www.)?instagram.com\/?([a-zA-Z0-9\\.\\_\\-]+)?\/([reel]+)?\/([a-zA-Z0-9\-\\_\\.]+)\/?([0-9]+)?/gm,
  async cmd (bot, body) {
    const { chat: { id }, text: reel } = body
    const isLoading = await bot.sendMessage(id, 'Enviando video...')
    const deleteIsLoading = async () =>
      await bot.deleteMessage(id, isLoading.message_id)
    try {
      const { video: media } = await instaVideoSave({ reel })
      const [{ video }] = media
      await bot.sendVideo(id, video)
    } catch (errorIG) {
      console.log({ errorIG })
      bot.sendMessage(id, 'A ocurrido un error, vuelve a intentarlo mas tarde')
    } finally {
      deleteIsLoading()
    }
  }
}
