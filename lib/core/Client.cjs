const TelegramBot = require('node-telegram-bot-api')
const BotUtils = require('./Utils.cjs')
const { configEnv: { NODE_ENV, TELEGRAM_TOKEN_PROD, TELEGRAM_TOKEN_DEV } } = require('../helpers/Helpers.cjs')
/**
 * @type {import('node-telegram-bot-api')}
 */
module.exports = class extends TelegramBot {
  commands = new Map()
  constructor(
    token = NODE_ENV === 'production' ? TELEGRAM_TOKEN_PROD : TELEGRAM_TOKEN_DEV,
    options = {
      polling: true
    }
  ) {
    super(token, {
      ...options
    })
    // this.db = new Database()
    // this.commands = new Map()
    this.slashArray = []
    this.utils = new BotUtils(this)
    this.start()
    this.getMe().then(function (me) {
      console.log(
        `[Telegram] Telegram connection established. Logged in as: https://t.me/${me.username}`
          .rainbow
      )
    })
  }
  /**
   * 
   * @param {import('node-telegram-bot-api').ChatId} chatId 
   * @param {import('node-telegram-bot-api').InputMedia} images 
   * @param {import('node-telegram-bot-api').SendMediaGroupOptions} options 
   */
  async sendMediaGroupTenByTen(chatId, images, options = {}) {
    // Divide las imágenes en grupos de 10
    const chunkedImages = images.reduce((acc, cur, i) => {
      if (i % 10 === 0) {
        acc.push([cur])
      } else {
        acc[acc.length - 1].push(cur)
      }
      return acc
    }, [])

    // Envía cada grupo de 10 imágenes
    for (const chunk of chunkedImages) {
      await this.sendMediaGroup(chatId, chunk, options)
    }
  }
  /**
   * 
   * @param {import('node-telegram-bot-api').ChatId} chatId 
   * @param {import('node-telegram-bot-api').InputMedia} documents 
   * @param {import('node-telegram-bot-api').SendDocumentOptions} options 
   */
  async sendDocumentOnebyOne(chatId, documents, options = {}) {
    const bot = this
    // Mapea cada documento a una promesa de envío
    const promises = documents.map(async (document) => {
      await bot.sendDocument(chatId, document, options);
    });

    // Espera a que todas las promesas se completen
    await Promise.all(promises);
  }

  async start() {
    await this.loadEvents()
    await this.loadHandlers()
    await this.loadCommands()
    await this.loadCommandsSlash()
  }

  async loadCommands() {
    // this.removeAllListeners()
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
            if (COMANDO.active) this.commands.set(COMANDO.ExpReg, COMANDO)
          }
          // this.loadEvents()
          // this.onText(COMANDO.ExpReg, COMANDO.cmd.bind(null, this))
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

  getCommands() {
    return Array.from(this.commands)
  }

  findCommand(str) {
    const cmd = this.getCommands().find(([expreg]) => expreg.test(str))
    if (typeof cmd === 'undefined') {
      return [false, []]
    }
    return [true, cmd]
  }

  async loadCommandsSlash() {
    console.log('(%) Cargando Comandos Slash'.yellow)
    this.slashArray = []
    const RUTA_ARCHIVOS = await this.utils.loadFiles('/lib/commandSlash')

    if (RUTA_ARCHIVOS.length) {
      RUTA_ARCHIVOS.forEach((rutaArchivo) => {
        try {
          const COMANDO = require(rutaArchivo)
          // this.setMyCommands(COMANDOS)

          this.slashArray.push(...COMANDO)
          console.log(`(/) ${COMANDO.length} Comandos Slash Cargados`.green)
        } catch (e) {
          console.log({ e })
          console.log(`(/) ERROR AL CARGAR EL COMANDO ${rutaArchivo}`.bgRed)
        }
      })
      this.setMyCommands(this.slashArray)
    }

    /* this.getMyCommands().then(() => {
      console.log(`(/) ${this.slashArray.length} Comandos Publicados!`.green)
      this.setMyCommands(this.slashArray)
    }) */
  }

  async loadHandlers() {
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

  async loadEvents() {
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
}
