import { exec } from 'node:child_process'
import type { ClientBot } from '../../core/main.js'
import type { Message } from '../../interfaces/cls.message.js'
import { BOT_USERNAME, ownersId } from '../../helpers/Helpers.js'

export default {
    active: true,
    OWNER: true,
    regexp: new RegExp(`^/restart(?:@${BOT_USERNAME})?$`, 'im'),
    async cmd(client: ClientBot, message: Message) {
        const userId = message.getData().from?.id
        if (userId === undefined || !ownersId.includes(userId)) {
            await message.reply('Solo el owner puede usar este comando.')
            return
        }

        await message.reply('Reiniciando bot...')
        exec('pm2 restart t_bot', (error) => {
            if (error) {
                console.error('Error restart:', error)
                void client.api.sendMessage({ chat_id: message.chatId, text: `Error: ${error.message}` })
            }
        })
    }
}
