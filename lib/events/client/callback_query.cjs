const { fetchAndSendStw, getStwCaption } = require('../../helpers/stw.helper.cjs')
const { fetchAndSendClima, getClimaCaption } = require('../../command/cmd/cmdClima.cjs')

/**
 * @param {import('node-telegram-bot-api')} client
 * @param {import('node-telegram-bot-api').CallbackQuery} callbackQuery
 */
module.exports = async (client, callbackQuery) => {
  const { data, message } = callbackQuery
  const chatId = message?.chat?.id
  const messageId = message?.message_id

  if (!data || !chatId) {
    return client.answerCallbackQuery(callbackQuery.id)
  }

  const [action, ...rest] = data.split('|')
  const params = rest.join('|')

  switch (action) {
    case 'stw_refresh':
      try {
        const caption = getStwCaption()
        await fetchAndSendStw(client, chatId, caption)
        await client.deleteMessage(chatId, messageId)
      } catch (error) {
        await client.sendMessage(chatId, `❌ Error: ${error.message}`)
      }
      break
    case 'clima_refresh':
      try {
        const caption = getClimaCaption(params)
        await fetchAndSendClima(client, chatId, params, caption)
        await client.deleteMessage(chatId, messageId)
      } catch (error) {
        await client.sendMessage(chatId, `❌ Error: ${error.message}`)
      }
      break
    default:
      client.answerCallbackQuery(callbackQuery.id, {
        text: 'Has presionado un botón',
        show_alert: true
      })
      break
  }

  client.answerCallbackQuery(callbackQuery.id)
}
