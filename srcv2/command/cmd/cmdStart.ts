import type { ClientBot } from '../../core/main.js'
import type { Message } from '../../interfaces/cls.message.js'
import { BOT_USERNAME } from '../../helpers/Helpers.js'

export default {
    active: true,
    OWNER: false,
    regexp: new RegExp(`^/start(?:@${BOT_USERNAME})?`, 'im'),
    async cmd(_bot: ClientBot, message: Message) {
        await message.reply(`
Hola, soy un bot creado por @kreisler

Que puedo hacer:

*YouTube* - Envia un link y descargo el audio automaticamente.
*Tiktok* - Envia un link y descargo el video sin watermark.
*TIDAL* - Busqueda inline con @meutilbot .q cancion.

Comandos:
- /start - Este mensaje
- /donate - Donaciones
- /stickers - Descargar stickers
- /whatif <pregunta> - Preguntar a IA
- /demucs - Separar voces e instrumental
- /stw - Imagen STW Daily
- /ping - Tiempo de respuesta
- /uptime - Tiempo activo
- /restart - Solo owner
`, { parse_mode: 'Markdown' })
    }
}
