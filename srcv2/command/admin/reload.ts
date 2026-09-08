import type { ClientBot } from '../../core/main.js'
import type { Message } from '../../interfaces/cls.message.js'
import { BOT_USERNAME } from '../../helpers/Helpers.js'

export default {
  regexp: new RegExp(`^/reload(?:@${BOT_USERNAME})?(\\s+)(.+)$|^/reload(?:@${BOT_USERNAME})?`),
  OWNER: true,
  active: true,
  async cmd(client: ClientBot, message: Message, args: RegExpMatchArray | null) {
    const option = args?.[2] ?? args?.[1] ?? ''
    let label = 'Comandos, Eventos y Handlers'

    try {
      switch (option) {
        case 'comands':
        case 'comandos':
          label = 'Comandos'
          await client.loadCommands()
          break
        case 'slash':
        case 'slashcommands':
          label = 'Comandos Slash'
          await client.loadCommandsSlash()
          break
        case 'eventos':
        case 'events':
          label = 'Eventos'
          await client.loadEvents()
          break
        case 'handlers':
          label = 'Handlers'
          await client.loadHandlers()
          break
        default:
          await client.initialize()
      }
      await message.reply(`✅ ${label} Recargados\n> *Okay!*`, { parse_mode: 'Markdown' })
    } catch {
      await message.reply('Ha ocurrido un error al recargar el bot. Mira la consola para más detalles.')
    }
  }
}
