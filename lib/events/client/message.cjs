const { owners, ownersId } = require('../../helpers/Helpers.cjs')
module.exports = async (client, msg) => {
  const { text, chat, from } = msg
  const existe = client.execCommand(text)
  if (existe) {
    const [ExpReg, comando] = client.findCommand(text)
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
      comando.cmd(client, msg, text.match(ExpReg))
    } catch (e) {
      client.sendMessage(chat.id,
        `*Ha ocurrido un error al ejecutar el comando \`${text}\`*\n*Mira la consola para más detalle*`,
        { parse_mode: 'MarkdownV2', reply_to_message_id: msg.message_id }
      )
      console.log(e)
    }
  }
}
