import { exec } from 'node:child_process'
import { configEnv } from '../../helpers/Helpers.js'

export default {
  active: true,
  ExpReg: new RegExp(`^/restart(?:@${configEnv.USERNAME_BOT})?$`, 'im'),
  async cmd (client: any, msg: any) {
    const { from: { id: userId }, chat: { id: chatId } } = msg

    if (userId !== configEnv.OWNER_ID) {
      return client.sendMessage(chatId, '⛔ Solo el owner puede usar este comando.')
    }

    await client.sendMessage(chatId, '♻️ Reiniciando bot...')

    exec('pm2 restart t_bot', (error) => {
      if (error) {
        console.error('Error restart:', error)
        client.sendMessage(chatId, `❌ Error: ${error.message}`)
      }
    })
  }
}
