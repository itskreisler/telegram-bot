module.exports = {
  ExpReg: /^\/reload (.+)|^\/reload/,
  OWNER: true,
  active: true,
  async cmd (client, message, args) {
    const { chat: { id } } = message

    const [cmd, arg] = args
    let opcion = 'Comandos, Eventos y Handlers'

    try {
      switch (arg || cmd) {
        case 'comands':
        case 'comandos':
          opcion = 'Comandos'
          await client.loadCommands()
          break
        case 'slash':
        case 'slashcommands':
          opcion = 'Comandos Slash'
          await client.loadCommandsSlash()
          break
        case 'eventos':
        case 'events':
          opcion = 'Eventos'
          await client.loadEvents()
          break

        case 'handlers':
          opcion = 'Handlers'
          await client.loadHandlers()
          break

        default:
          await client.loadEvents()
          await client.loadHandlers()
          await client.loadCommands()
          await client.loadCommandsSlash()
          break
      }

      client.sendMessage(id, `✅ ${opcion} Recargados\n> *Okay!*`, { parse_mode: 'Markdown' })
    } catch (e) {
      client.sendMessage(id, '**Ha ocurrido un error a al recargar el bot!**\n*Mira la consola para más detalles.*')
      console.log(e)
    }
  }
}
