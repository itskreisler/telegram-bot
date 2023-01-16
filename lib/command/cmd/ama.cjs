const { configEnv } = require('../../helpers/Helpers.cjs')
const { executeAI } = require('../../helpers/OpenAi.cjs')

module.exports = {
  active: true,
  ExpReg: new RegExp(`^/ama(?:@${configEnv.USERNAME_BOT})?(\\s+)((.|\n)+)$`, 'im'), /* /^\/ping(?:@uwunubot)?$/im, */
  async cmd (bot, msg, match) {
    const { chat: { id } } = msg
    const [,, resp] = match
    const isLoading = await bot.sendMessage(id, 'Preguntando...')
    const deleteIsLoading = async () => await bot.deleteMessage(id, isLoading.message_id)

    try {
      const req = await executeAI(resp)
      const {
        choices: [{ text }]
      } = await req
      bot.sendMessage(id, `\`\`\`${text}\`\`\``, { parse_mode: 'Markdown' })
    } catch (error) {
      bot
        .sendMessage(
          id,
          'A ocurrido un error, vuelve a intentarlo mas tarde.'
        )
        // eslint-disable-next-line camelcase
        .then(({ message_id }) =>
          setTimeout(() => bot.deleteMessage(id, message_id), 3000)
        )
    } finally {
      deleteIsLoading()
    }
  }
}
