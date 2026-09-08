import type { ClientBot } from '../../core/main.js'
import type { Message } from '../../interfaces/cls.message.js'
import { BOT_USERNAME } from '../../helpers/Helpers.js'

export default {
    active: true,
    regexp: new RegExp(`^/donate(?:@${BOT_USERNAME})?$`, 'im'),
    async cmd(bot: ClientBot, message: Message) {
        await message.reply('Gracias por querer apoyarme, puedes hacerlo en el siguiente enlace:\n- *Paypal* [https://paypal.me/itskreisler](https://paypal.me/itskreisler)', { parse_mode: 'Markdown' })
    }
}
