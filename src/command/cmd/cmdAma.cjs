/* eslint-disable camelcase */
const { configEnv } = require('../../helpers/Helpers.cjs')
const { executeAI } = require('../../helpers/OpenAi.cjs')

module.exports = {
  active: false,
  ExpReg: new RegExp(
    `^/ama(?:@${configEnv.USERNAME_BOT})?(\\s+)((.|\n)+)$|^/ama(?:@${configEnv.USERNAME_BOT})?$`,
    'im'
  ) /* /^\/ping(?:@uwunubot)?$/im, */,
  async cmd (bot, msg, match) {
    const {
      chat: { id }
    } = msg
    const user = new Date()
      .toLocaleString('es-ES', {
        hour: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      .replace(/\/|\s|,|:/g, '')
      .concat(`${id}`)

    const [, , question] = match
    if (typeof question === 'undefined') {
      return await bot.sendMessage(
        id,
        'Aqui tienes un ejemplo de uso.\n/ama ¿¡Preguntame lo que quieras!?'
      )
    }
    const isLoading = await bot.sendMessage(id, 'Preguntando')

    const deleteIsLoading = async () =>
      await bot.deleteMessage(id, isLoading.message_id)

    try {
      const req = await executeAI(question, user)
      const {
        choices: [{ text }]
      } = await req
      bot.sendMessage(id, `\`\`\`${text}\`\`\``, { parse_mode: 'Markdown' })
    } catch (error) {
      bot
        .sendMessage(id, 'A ocurrido un error, vuelve a intentarlo mas tarde.')
        .then(({ message_id }) =>
          setTimeout(() => bot.deleteMessage(id, message_id), 3000)
        )
    } finally {
      setTimeout(() => deleteIsLoading(), 1000)
    }
  }
}
