/* eslint-disable camelcase */
const { configEnv, randomAnswer } = require('../../helpers/Helpers.cjs')

module.exports = {
  active: true,
  ExpReg: new RegExp(
        `^/whatif(?:@${configEnv.USERNAME_BOT})?(\\s+)((.|\n)+)$|^/whatif(?:@${configEnv.USERNAME_BOT})?$`,
        'im'
  ),
  async cmd (bot, msg, match) {
    const {
      chat: { id, username },
      from
    } = msg

    const [, , question] = match
    if (typeof question === 'undefined') {
      return await bot.sendMessage(
        id,
        'Debes introducir un texto para responderte a algo\nAqui tienes un ejemplo de uso.\n/whatif ¿¡Preguntame lo que quieras!?'
      )
    }
    const userQ = `@${username ?? from.username} preguntó: *${question}*\n`
    const botA = `*Mi respuesta es:* ${randomAnswer()}`
    bot.sendMessage(id, userQ + botA, { parse_mode: 'Markdown' })
  }
}
