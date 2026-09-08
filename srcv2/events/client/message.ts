import type { Context, SendMessageParams } from 'node-telegram-bot-api'
import type { ClientBot } from '../../core/main.js'
import { Message } from '../../interfaces/cls.message.js'
import { owners, ownersId } from '../../helpers/Helpers.js'

export default async function messageHandler(client: ClientBot, context: Context) {
    const message = context.message
    if (!message?.text || !message.chat || !message.from) return

    const { text, chat, from } = message
    console.log('(Logs->text)', {
        text,
        chatUsername: chat.username || chat.first_name,
        fromUsername: from.username || from.first_name
    })

    const [exists, commandMatch] = client.findCommand(text)
    if (!exists || commandMatch.length === 0) return

    const [regexp, command] = commandMatch
    if (command.OWNER && !ownersId.includes(from.id)) {
        const ownerMessage: SendMessageParams = {
            chat_id: chat.id,
            text: `❌ *Solo los dueños de este bot pueden ejecutar este comando*\n*Dueños del bot:* ${owners
                .map(([user, id]) => `[${user}](tg://user?id=${id})`)
                .join(', ')}`,
            parse_mode: 'MarkdownV2',
            reply_parameters: { message_id: message.message_id }
        }
        await client.api.sendMessage(ownerMessage)
        return
    }

    try {
        await command.cmd(client, new Message(client, message), text.match(regexp))
    } catch (error) {
        const errorMessage: SendMessageParams = {
            chat_id: chat.id,
            text: `*Ha ocurrido un error al ejecutar el comando \`${text}\`*\n*Mira la consola para más detalle*`,
            parse_mode: 'MarkdownV2',
            reply_parameters: { message_id: message.message_id }
        }
        await client.api.sendMessage(errorMessage)
        console.error(error)
    }
}
