import type { ClientBot } from '../../core/main.js'
import type { Message } from '../../interfaces/cls.message.js'
import { BOT_USERNAME } from '../../helpers/Helpers.js'

export default {
    active: true,
    regexp: new RegExp(`^/ping(?:@${BOT_USERNAME})?$`, 'im'),
    async cmd(bot: ClientBot, message: Message) {
        const start = Date.now()
        const sent = await message.send({ text: '*Pinging...*', options: { parse_mode: 'Markdown' } })
        const latency = Date.now() - start
        await sent.editText(`*Pong! Latency is* \`${latency}ms\``, { parse_mode: 'Markdown' })
    }
}
