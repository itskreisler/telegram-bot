import { owners, ownersId } from '../../helpers/Helpers.js'
import { debounce } from '@kreisler/js-helpers'

function messageHandler ({ client, msg, comando, ExpReg }: any) {
  const { text } = msg
  comando.cmd(client, msg, text.match(ExpReg))
}

const messageDebounced: any = debounce(messageHandler, 5000, {
  immediate: true,
  flood: 5,
  onFlood: (ctx: any) =>
    ctx.client.sendMessage(
      ctx.msg.chat.id,
      '🚨 *Flood detectado*\n_Espera 5 segundos antes de volver a ejecutar un comando_',
      { parse_mode: 'MarkdownV2', reply_parameters: { message_id: ctx.msg.message_id } }
    )
})

export default async (client: any, msg: any) => {
  const { text, chat, from } = msg
  console.log('(Logs->text)', {
    text,
    chatUsername: chat.username || chat.first_name,
    fromUsername: from.username || from.first_name
  })
  console.log(JSON.stringify(msg, null, 2))
  const [existe, [ExpReg, comando]] = client.findCommand(text)
  if (!existe) return
  if (existe) {
    if (comando.OWNER) {
      if (!ownersId.includes(from.id)) {
        return await client.sendMessage(
          chat.id,
          `❌ *Solo los dueños de este bot pueden ejecutar este comando*\n*Dueños del bot:* ${owners
            .map(([user, id]) => `[${user}](tg://user?id=${id})`)
            .join(', ')}`,
          { parse_mode: 'MarkdownV2', reply_parameters: { message_id: msg.message_id } }
        )
      }
    }
    try {
      if (typeof messageDebounced === 'function') {
        messageDebounced({ client, msg, comando, ExpReg })
      } else {
        messageHandler({ client, msg, comando, ExpReg })
      }
    } catch (e) {
      client.sendMessage(
        chat.id,
        `*Ha ocurrido un error al ejecutar el comando \`${text}\`*\n*Mira la consola para más detalle*`,
        { parse_mode: 'MarkdownV2', reply_to_message_id: msg.message_id }
      )
      console.log(e)
    }
  }
}
