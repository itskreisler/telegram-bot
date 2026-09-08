// const { instagramGetUrl } = require('instagram-url-direct')
module.exports = {
  active: true,
  ExpReg: /(?:https?:\/\/)?(?:www.)?instagram.com\/?([a-zA-Z0-9\\.\\_\\-]+)?\/([reel|reels|p]+)?\/([a-zA-Z0-9\-\\_\\.]+)\/?([0-9]+)?/gm,
  /**
   *
   * @param @param {import('../../core/Client.cjs')} bot
   * @param {*} body
   */
  async cmd (bot, body) {
    const { chat: { id }, text: link } = body
    const isLoading = await bot.sendMessage(id, 'Enviando...')
    const deleteIsLoading = async () =>
      await bot.deleteMessage(id, isLoading.message_id)
    try {
      /**
       * @type {{results_number: number[], url_list: string[]}}
       */
	console.log({link})
      const links = await (await globalThis.fetch('https://apis-public.vercel.app/api/services/ig', {
        method: 'POST',
        body: JSON.stringify({ url: link, retries: 10 }), headers: { 'Content-Type': 'application/json' }
    })).json()
      if(links?.error) {bot.sendMessage(id,JSON.stringify(links));return;}
      const cantidad = links.results_number
      // console.log(links)
      if (cantidad === 1) { 
	await bot.sendDocument(id, links.url_list[0]);
	console.log("Solo es un archivo")
	return
      }
	console.log("Mas de 1", links.url_list);
      await Promise.all([
        bot.sendDocumentOnebyOne(
          id,
          links.url_list
        )
      ])
    } catch (errorIG) {
      console.log({ errorIG })
      bot.sendMessage(id, 'A ocurrido un error, vuelve a intentarlo mas tarde')
    } finally {
      deleteIsLoading()
    }
  }
}
