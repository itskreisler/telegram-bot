import type { ClientBot } from '../../core/main.js'
import type { Message } from '../../interfaces/cls.message.js'
import { BOT_USERNAME, ParseMode } from '../../helpers/Helpers.js'

export default {
    active: true,
    regexp: new RegExp(`^/uptime(?:@${BOT_USERNAME})?$`, 'im'),
    async cmd(_bot: ClientBot, message: Message) {
        const uptime = process.uptime()
        const months = Math.floor(uptime / (30 * 24 * 60 * 60))
        const days = Math.floor((uptime % (30 * 24 * 60 * 60)) / (24 * 60 * 60))
        const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60))
        const minutes = Math.floor((uptime % (60 * 60)) / 60)
        const seconds = Math.floor(uptime % 60)
        const uptimeMessage = new Intl.ListFormat('es-ES').format([
            `${months} meses`, `${days} dias`, `${hours} horas`, `${minutes} minutos`, `${seconds} segundos`
        ])

        await message.reply(`*Bot Uptime*\n\n*Estoy activo desde hace:*\n${uptimeMessage}`, {
            parse_mode: ParseMode.Markdown
        })
    }
}
