import type { ClientBot } from '../../core/main.js'
import type { Message } from '../../interfaces/cls.message.js'
import { BOT_USERNAME, randomAnswer } from '../../helpers/Helpers.js'

export default {
    active: false,
    regexp: new RegExp(`^/whatif(?:@${BOT_USERNAME})?(\\s+)((.|\\n)+)$|^/whatif(?:@${BOT_USERNAME})?$`, 'im'),
    async cmd(_bot: ClientBot, message: Message, match: RegExpMatchArray | null) {
        const question = match?.[2]
        if (question === undefined) {
            await message.reply('Debes introducir un texto para responderte a algo.\nEjemplo: /whatif preguntame lo que quieras')
            return
        }

        const user = message.getData().from?.username ?? message.getData().from?.first_name ?? 'alguien'
        await message.reply(`@${user} pregunto: *${question}*\n\n*Mi respuesta es:* ${randomAnswer()}`, {
            parse_mode: 'Markdown'
        })
    }
}
