const BotUtils = require('./Utils.cjs')
const { configEnv: { NODE_ENV, TELEGRAM_TOKEN_PROD, TELEGRAM_TOKEN_DEV } } = require('../helpers/Helpers.cjs')

const token = NODE_ENV === 'production' ? TELEGRAM_TOKEN_PROD : TELEGRAM_TOKEN_DEV
const options = {
  polling: true,
  baseApiUrl: process.env.TELEGRAM_BASE_URL || 'https://api.telegram.org'
}

module.exports = async () => {
  const { default: TelegramBot } = await import('node-telegram-bot-api')

  /**
   * @param {import('node-telegram-bot-api').ChatId} chatId
   * @param {import('node-telegram-bot-api').InputMedia} images
   * @param {import('node-telegram-bot-api').SendMediaGroupParams} options
   */
  async function sendMediaGroupTenByTen(client, chatId, images, options = {}) {
    const chunkedImages = images.reduce((acc, cur, i) => {
      if (i % 10 === 0) {
        acc.push([cur])
      } else {
        acc[acc.length - 1].push(cur)
      }
      return acc
    }, [])

    for (const chunk of chunkedImages) {
      await client.sendMediaGroup(chatId, chunk, options)
    }
  }

  /**
   * @param {import('node-telegram-bot-api').ChatId} chatId
   * @param {import('node-telegram-bot-api').InputMedia} documents
   * @param {import('node-telegram-bot-api').SendDocumentParams} options
   */
  async function sendDocumentOnebyOne(client, chatId, documents, options = {}) {
    const promises = documents.map(async (document) => {
      await client.sendDocument(chatId, document, options)
    })
    await Promise.all(promises)
  }

  const client = new TelegramBot(token, options)
  client.commands = new Map()
  client.slashArray = []
  client.utils = new BotUtils(client)
  client.sendMediaGroupTenByTen = sendMediaGroupTenByTen.bind(null, client)
  client.sendDocumentOnebyOne = sendDocumentOnebyOne.bind(null, client)

  client.findCommand = function findCommand(str) {
    const cmd = Array.from(this.commands).find(([expreg]) => expreg.test(str))
    if (typeof cmd === 'undefined') {
      return [false, []]
    }
    return [true, cmd]
  }

  client.getCommands = function getCommands() {
    return Array.from(this.commands)
  }

  client.loadCommands = async function loadCommands() {
    console.log(`(${process.env.TELEGRAM_PREFIX}) Cargando comandos`.yellow)
    this.commands.clear()
    const RUTA_ARCHIVOS = await this.utils.loadFiles('/lib/command')

    if (RUTA_ARCHIVOS.length) {
      RUTA_ARCHIVOS.forEach((rutaArchivo) => {
        try {
          const COMANDO = require(rutaArchivo)
          const NOMBRE_COMANDO = rutaArchivo
            .split('\\')
            .pop()
            .split('/')
            .pop()
            .split('.')
            .shift()
          if (NOMBRE_COMANDO && 'active' in COMANDO) {
            if (COMANDO.active) console.log(`Cargando comando: ${NOMBRE_COMANDO}`);
            if (COMANDO.active) this.commands.set(COMANDO.ExpReg, COMANDO)
          }
        } catch (e) {
          console.log(`ERROR AL CARGAR EL COMANDO ${rutaArchivo}`.bgRed)
        }
      })
      console.log(
        `(${process.env.TELEGRAM_PREFIX}) ${this.commands.size}  Comandos cargados`
          .green
      )
    }
  }

  client.loadCommandsSlash = async function loadCommandsSlash() {
    console.log('(%) Cargando Comandos Slash'.yellow)
    this.slashArray = []
    const RUTA_ARCHIVOS = await this.utils.loadFiles('/lib/commandSlash')

    if (RUTA_ARCHIVOS.length) {
      RUTA_ARCHIVOS.forEach((rutaArchivo) => {
        try {
          const COMANDO = require(rutaArchivo)
          this.slashArray.push(...COMANDO)
          console.log(`(/) ${COMANDO.length} Comandos Slash Cargados`.green)
        } catch (e) {
          console.log({ e })
          console.log(`(/) ERROR AL CARGAR EL COMANDO ${rutaArchivo}`.bgRed)
        }
      })
      this.setMyCommands(this.slashArray)
    }
  }

  client.loadHandlers = async function loadHandlers() {
    console.log('(%) Cargando handlers'.yellow)

    const RUTA_ARCHIVOS = await this.utils.loadFiles('/lib/handlers')

    if (RUTA_ARCHIVOS.length) {
      RUTA_ARCHIVOS.forEach((rutaArchivo) => {
        try {
          require(rutaArchivo)(this)
        } catch (e) {
          console.log(`ERROR AL CARGAR EL HANDLER ${rutaArchivo}`.bgRed)
        }
      })
    }

    console.log(`(-) ${RUTA_ARCHIVOS.length} Handlers Cargados`.green)
  }

  client.loadEvents = async function loadEvents() {
    console.log('(%) Cargando eventos'.yellow)

    const RUTA_ARCHIVOS = await this.utils.loadFiles('/lib/events')

    this.removeAllListeners()

    if (RUTA_ARCHIVOS.length) {
      RUTA_ARCHIVOS.forEach((rutaArchivo) => {
        try {
          const EVENTO = require(rutaArchivo)
          const NOMBRE_EVENTO = rutaArchivo
            .split('\\')
            .pop()
            .split('/')
            .pop()
            .split('.')
            .shift()
          this.on(NOMBRE_EVENTO, EVENTO.bind(null, this))
        } catch (e) {
          console.log(e)
          console.log(`ERROR AL CARGAR EL EVENTO ${rutaArchivo}`.bgRed)
        }
      })
    }

    console.log(`(+) ${RUTA_ARCHIVOS.length} Eventos Cargados`.green)
  }

  client.start = async function start() {
    await this.loadEvents()
    await this.loadHandlers()
    await this.loadCommands()
  }

  await client.start()
  client.getMe().then(function (me) {
    console.log(
      `[Telegram] Telegram connection established. Logged in as: https://t.me/${me.username}`
        .rainbow
    )
  })

  return client
}
