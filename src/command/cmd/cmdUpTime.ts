import { configEnv, ParseMode } from '../../helpers/Helpers.js'

export default {
  active: true,
  ExpReg: new RegExp(`^/uptime(?:@${configEnv.USERNAME_BOT})?$`, 'im'),
  async cmd (bot: any, msg: any) {
    const {
      chat: { id }
    } = msg
    const uptime = process.uptime()

    const months = Math.floor(uptime / (30 * 24 * 60 * 60))
    const days = Math.floor((uptime % (30 * 24 * 60 * 60)) / (24 * 60 * 60))
    const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((uptime % (60 * 60)) / 60)
    const seconds = Math.floor(uptime % 60)
    const uptimeMessage = new Intl.ListFormat('es-ES').format([
      `${months} meses`,
      `${days} días`,
      `${hours} horas`,
      `${minutes} minutos`,
      `${seconds} segundos`
    ])

    bot.sendMessage(
      id,
      `
    *🤖 Bot Uptime*
    \n*Estoy activo desde hace:*\n${uptimeMessage}`,
      { parse_mode: ParseMode.Markdown }
    )
  }
}
