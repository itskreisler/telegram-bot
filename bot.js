import { lang } from './src/language.js'
import { typeOptions } from './src/helpers.js'
import { bot } from './src/bot.js'
import { cmds } from './src/commands/comandos.js'
// import { userExist, userDb, userJson } from './src/db/users.db.js'
import { cmdlangReplyMarkup } from './src/commands/lang.js'

if (lang.welcome === '') lang.cb('en')

bot.setMyCommands([
  {
    command: 'start',
    description: 'Iniciar el bot'
  },
  {
    command: 'lang',
    description: 'Cambiar el idioma'
  },
  {
    command: 'ama',
    description: 'Ask My Anything ChatGPT'
  },
  {
    command: 'ping',
    description: 'pong'
  },
  {
    command: 'off',
    description: 'off by admin'
  }
])
cmds.forEach(({ cmd, cb }) => bot.onText(cmd, cb))

bot.on('message', async (msg) => {
  const { text } = msg
  if (text.startsWith('/')) {
    const [content] = text.split('/')
    console.log(content)
  }
  // const [user] = userExist(from.id)

  // console.log(from)
  /* if (user && !from.is_bot) {
    userDb.update(
      userJson,
      (element) => element.id === from.id,
      from
    )
  } else {
    userDb.insert(userJson, { ...from, setLang: 'en' })
  }
  const [getLang] = userDb.select(userJson, ({ id }) => id === from.id)
  if (typeof getLang !== 'undefined') {
    // eslint-disable-next-line no-prototype-builtins
    if (getLang.hasOwnProperty('setLang')) {
      const { setLang } = getLang
      lang.cb(setLang)
    }
  } */
})

bot.on('inline_query', async (msg) => {
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
})

bot.on('chosen_inline_result', async (result) => {
  /* if (typeof chatID === "undefined") {
    console.error("Sin identificación de chat para esta consulta en línea");
    return;
  }
  //bot.sendMessage(result.from.id, result.result_id);
  await bot.sendMessage(chatID, "message", { parse_mode: "HTML" }); */
})

bot.on('polling_error', (error) => {
  console.error(error)
})

bot.on('callback_query', (callbackQuery) => {
  const { text, action } = typeOptions(callbackQuery)
  // console.log(callbackQuery);
  switch (action) {
    case 'answerCallbackQuery':
      bot.editMessageText(lang.lang, {
        chat_id: callbackQuery.message.chat.id,
        message_id: callbackQuery.message.message_id,
        reply_markup: cmdlangReplyMarkup
      })
      bot.answerCallbackQuery(callbackQuery.id, {
        text,
        show_alert: true
      })
      break
    case 'editMessageText':
      (() => {
        const msg = callbackQuery.message
        const opts = {
          chat_id: msg.chat.id,
          message_id: msg.message_id
        }
        bot.editMessageText(text, opts)
      })()
      break
    default:
      bot.answerCallbackQuery(callbackQuery.id, {
        text: 'has preinado un boton',
        show_alert: true
      })
      break
  }
})
