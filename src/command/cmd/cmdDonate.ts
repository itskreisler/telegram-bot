import { configEnv } from '../../helpers/Helpers.js'

export default {
  active: true,
  ExpReg: new RegExp(`^/donate(?:@${configEnv.USERNAME_BOT})?$`, 'im'),
  async cmd (bot: any, msg: any) {
    const { chat: { id: chatId } } = msg
    bot.sendMessage(chatId, 'Gracias por querer apoyarme, puedes hacerlo en el siguiente enlace:\n- *Paypal* [https://paypal.me/itskreisler](https://paypal.me/itskreisler)', { parse_mode: 'Markdown' })
  }
}
