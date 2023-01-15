
module.exports = async (bot, msg) => {
  const { id, query } = msg
  if (query.length === 0 || !query) return
  const inlineQueryResults = [
    {
      type: 'article',
      id: 'id|1',
      title: `Opción 1: ${query}`,
      description: 'description',
      input_message_content: {
        message_text: 'Has seleccionado la opción 1'
      },
      reply_markup: {
        inline_keyboard: [
          [{ text: 'cambiarElChatActualDeConsultaEnLínea', switch_inline_query_current_chat: '... ' }],
          [{ text: 'datosDeDevoluciónDeLlamada', callback_data: 'test|1' },
            { text: 'url', url: 'https://example.com/' }]
        ]
      }
    }
  ]
  await bot.answerInlineQuery(id, inlineQueryResults, {
    cache_time: 10,
    switch_pm_text: 'Modo de uso',
    switch_pm_parameter: 'help'
  })
}
