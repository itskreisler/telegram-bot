import { bot } from '../bot.js'
import { executeAI } from '../openai.js'

const isLoading = async (chatId, sms = 'Enviando...') =>
  await bot.sendMessage(chatId, sms)
const deleteIsLoading = async (chatId) =>
  await bot.deleteMessage(chatId, isLoading().message_id)
export const cmdAmaRegExp = /\/ama (.+)/

export const cmdAmaFn = async (msg, match) => {
  const chatId = msg.chat.id
  const resp = match[1]
  isLoading(chatId)
  try {
    const req = await executeAI(resp)
    const {
      choices: [{ text }]
    } = await req
    // console.log(text)
    bot.sendMessage(chatId, text)
  } catch (error) {
    bot
      .sendMessage(
        chatId,
        'A ocurrido un error, vuelve a intentarlo mas tarde.'
      )
      // eslint-disable-next-line camelcase
      .then(({ message_id }) =>
        setTimeout(() => bot.deleteMessage(chatId, message_id), 3000)
      )
  } finally {
    deleteIsLoading(chatId)
  }
}
