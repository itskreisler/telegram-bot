const { owners, ownersId } = require('../../helpers/Helpers.cjs')
const _ = import('@kreisler/js-helpers/src/fn/debounce.js')
let messageDebounced = null;
(async () => {
  const { debounce } = await _
  messageDebounced = debounce(messageHandler, 5000, {
    immediate: true,
    flood: 5,
    onFlood: (ctx) =>
      ctx.client.sendMessage(
        ctx.msg.chat.id,
        '🚨 *Flood detectado*\n_Espera 5 segundos antes de volver a ejecutar un comando_',
        { parse_mode: 'MarkdownV2', reply_to_message_id: ctx.msg.message_id }
      )
  })
})()
// Función de manejo del evento "message"
function messageHandler ({ client, msg, comando, ExpReg }) {
  const { text } = msg
  // aquí se realizaría la acción correspondiente al mensaje recibido
  comando.cmd(client, msg, text.match(ExpReg))
}

/**
 *
 * @param {import('node-telegram-bot-api')} client
 * @param {import('node-telegram-bot-api').Message} msg
 */
module.exports = async (client, msg) => {
  const { text, chat, from } = msg
  console.log('(Logs->text)', {
    text,
    chatUsername: chat.username || chat.first_name,
    fromUsername: from.username || from.first_name
  })
  const [existe, [ExpReg, comando]] = client.findCommand(text)
  // cancela el comando si no existe
  if (!existe) return
  if (existe) {
    if (comando.OWNER) {
      if (!ownersId.includes(from.id)) {
        return await client.sendMessage(
          chat.id,
          `❌ *Solo los dueños de este bot pueden ejecutar este comando*\n*Dueños del bot:* ${owners
            .map(([user, id]) => `[${user}](tg://user?id=${id})`)
            .join(', ')}`,
          { parse_mode: 'MarkdownV2', reply_to_message_id: msg.message_id }
        )
      }
    }
    try {
      messageDebounced({ client, msg, comando, ExpReg })
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
