import { lang } from './src/language.js'
import { typeOptions } from './src/helpers.js'
import { bot } from './src/bot.js'
import { cmds } from './src/commands/comandos.js'
import { userExist, userDb, userJson } from './src/db/users.db.js'
import { cmdlangReplyMarkup } from './src/commands/lang.js'

// if (lang.welcome === '') lang.cb('en')

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
    command: 'help',
    description: 'Mostrar la ayuda'
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
  const { from } = msg
  const [user] = userExist(from.id)

  // console.log(from)
  if (user && !from.is_bot) {
    /* userDb.update(
      userJson,
      (element) => element.id === from.id,
      from
    ) */
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
  }
})

bot.on('inline_query', (msg) => {
  const { id, query } = msg
  if (query.length === 0 || !!query) return
  const inlineQueryResults = [
    {
      type: 'article',
      id: 'id|1',
      title: `Opción 1: ${query}`,
      input_message_content: {
        message_text: 'Has seleccionado la opción 1'
      },
      reply_markup: {
        inline_keyboard: [
          [{ text: 'uno', callback_data: 'test|0' }],
          [{ text: 'cero', callback_data: 'test|1' }]
        ]
      }
    }
  ]
  bot.answerInlineQuery(id, inlineQueryResults, { cache_time: 10 })
})

bot.on('chosen_inline_result', async (result) => {
  /* if (typeof chatID === "undefined") {
    console.error("Sin identificación de chat para esta consulta en línea");
    return;
  }

  //bot.sendMessage(result.from.id, result.result_id);
  await bot.sendMessage(chatID, "message", { parse_mode: "HTML" }); */
})

bot.on('polling_error', function (error) {
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
      console.log('hola mundo')
      break
  }
})
