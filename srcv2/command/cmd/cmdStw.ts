import type { ClientBot } from '../../core/main.js'
import type { Message } from '../../interfaces/cls.message.js'
import { BOT_USERNAME } from '../../helpers/Helpers.js'
import { fetchAndSendStw } from '../../helpers/stw.helper.js'

export default {
    active: true,
    regexp: new RegExp(`^/stw(?:@${BOT_USERNAME})?$`, 'im'),
    async cmd(bot: ClientBot, message: Message) {
        await fetchAndSendStw(bot, message.chatId)
    }
}
