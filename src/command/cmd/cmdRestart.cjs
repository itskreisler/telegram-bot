const { exec } = require('child_process')
const { configEnv: { USERNAME_BOT, OWNER_ID } } = require('../../helpers/Helpers.cjs')

/**
 * Reinicia el bot (solo owner)
 */
module.exports = {
  active: true,
  ExpReg: new RegExp(`^/restart(?:@${USERNAME_BOT})?$`, 'im'),
  /**
   * @param {import('node-telegram-bot-api')} client
   * @param {import('node-telegram-bot-api').Message} msg
   */
  async cmd (client, msg) {
    const { from: { id: userId }, chat: { id: chatId } } = msg

    if (userId !== OWNER_ID) {
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
