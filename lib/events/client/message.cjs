const { owners, ownersId } = require('../../helpers/Helpers.cjs')
const _ = require('lodash')
// Función de manejo del evento "message"
function messageHandler ({ client, msg, comando, ExpReg }) {
  const { text } = msg
  // aquí se realizaría la acción correspondiente al mensaje recibido
  comando.cmd(client, msg, text.match(ExpReg))
}
// Envolver la función de manejo del evento con una función de debounce
const messageDebounced = _.debounce(messageHandler, 5000, {
  leading: true,
  trailing: false
})
module.exports = async (client, msg) => {
  const { text, chat, from } = msg
  console.log('(Logs->text)', { text, chatUsername: chat.username, fromUsername: from.username })
  const [existe, [ExpReg, comando]] = client.findCommand(text)
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
