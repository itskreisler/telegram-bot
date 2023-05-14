const { configEnv } = require('../../helpers/Helpers.cjs')
const { ParseMode } = require('../../helpers/Helpers.cjs')
module.exports = {
  active: true,
  ExpReg: new RegExp(`^/uptime(?:@${configEnv.USERNAME_BOT})?$`, 'im'),
  async cmd (bot, msg) {
    const {
      chat: { id }
    } = msg
    // Calcula el tiempo de actividad en segundos
    const uptime = process.uptime()

    // Convierte los segundos a meses, días, horas, minutos y segundos
    const months = Math.floor(uptime / (30 * 24 * 60 * 60))
    const days = Math.floor((uptime % (30 * 24 * 60 * 60)) / (24 * 60 * 60))
    const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((uptime % (60 * 60)) / 60)
    const seconds = Math.floor(uptime % 60)
    // Crea el mensaje de tiempo de actividad
    const uptimeMessage = new Intl.ListFormat('es-ES').format([
      `${months} meses`,
      `${days} días`,
      `${hours} horas`,
      `${minutes} minutos`,
      `${seconds} segundos`
    ])

    // Envía el mensaje al chat del usuario que hizo el comando
    bot.sendMessage(
      id,
      `
    *🤖 Bot Uptime*
    \n*Estoy activo desde hace:*\n${uptimeMessage}`,
      { parse_mode: ParseMode.Markdown }
    )
  }
}
