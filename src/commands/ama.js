import { bot } from '../bot.js'
import { executeAI } from '../openai.js'

export const cmdAmaRegExp = /\/ama(\s+)((.|\n)+)$/im

export const cmdAmaFn = async (msg, match) => {
  const chatId = msg.chat.id
  const [,, resp] = match
  const isLoading = await bot.sendMessage(chatId, 'Preguntando...')
  const deleteIsLoading = async () => await bot.deleteMessage(chatId, isLoading.message_id)
  try {
    const req = await executeAI(resp)
    const {
      choices: [{ text }]
    } = await req

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
    deleteIsLoading()
  }
}
