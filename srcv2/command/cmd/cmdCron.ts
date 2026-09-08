import type { ClientBot } from '../../core/main.js'
import type { Message } from '../../interfaces/cls.message.js'
import { BOT_USERNAME } from '../../helpers/Helpers.js'

export default {
    active: false,
    regexp: new RegExp(`^/(?:cron|c_t|c_d)(?:@${BOT_USERNAME})?(?:\\s+(.+))?$`, 'im'),
    async cmd(_client: ClientBot, message: Message) {
        await message.reply('El sistema de tareas programadas esta desactivado.')
    }
}
