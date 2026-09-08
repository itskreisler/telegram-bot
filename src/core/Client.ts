import { Bot } from 'node-telegram-bot-api'
import { pathToFileURL } from 'node:url'
import BotUtils from './Utils.js'
import { configEnv } from '../helpers/Helpers.js'
import 'colors'

const token = configEnv.NODE_ENV === 'production' ? configEnv.TELEGRAM_TOKEN_PROD : configEnv.TELEGRAM_TOKEN_DEV
const options = {
  polling: true,
  baseApiUrl: process.env.TELEGRAM_BASE_URL || 'https://api.telegram.org'
}

export class Client extends Bot {
  [key: string]: any
  commands = new Map<RegExp, any>()
  slashArray: any[] = []
  utils = new BotUtils(this)

  constructor(botToken = token, botOptions = options) {
    super(botToken || '', botOptions as any)
  }

  async getMe() {
    return await this.api.getMe()
  }

  async sendMessage(chatId: any, text: string, options: any = {}) {
    return await this.api.sendMessage({
      chat_id: chatId,
      text,
      ...options
    })
  }

  async sendPhoto(chatId: any, photo: any, options: any = {}) {
    return await this.api.sendPhoto({
      chat_id: chatId,
      photo,
      ...options
    })
  }

  async sendAudio(chatId: any, audio: any, options: any = {}) {
    return await this.api.sendAudio({
      chat_id: chatId,
      audio,
      ...options
    })
  }

  async sendVideo(chatId: any, video: any, options: any = {}) {
    return await this.api.sendVideo({
      chat_id: chatId,
      video,
      ...options
    })
  }

  async sendDocument(chatId: any, document: any, options: any = {}) {
    return await this.api.sendDocument({
      chat_id: chatId,
      document,
      ...options
    })
  }

  async deleteMessage(chatId: any, messageId: any) {
    return await this.api.deleteMessage({
      chat_id: chatId,
      message_id: messageId
    })
  }

  async editMessageText(text: string, options: any = {}) {
    const { chat_id, message_id, ...rest } = options
    return await this.api.editMessageText({
      chat_id,
      message_id,
      text,
      ...rest
    })
  }

  async answerCallbackQuery(callbackQueryId: string, options: any = {}) {
    if (typeof options === 'string') {
      options = { text: options }
    }
    return await this.api.answerCallbackQuery({
      callback_query_id: callbackQueryId,
      ...options
    })
  }

  async answerInlineQuery(inlineQueryId: string, results: any[], options: any = {}) {
    return await this.api.answerInlineQuery({
      inline_query_id: inlineQueryId,
      results,
      ...options
    })
  }

  async getFileLink(fileId: string) {
    const file = await this.api.getFile({ file_id: fileId })
    if (file.file_path) {
      return `https://api.telegram.org/file/bot${this.token}/${file.file_path}`
    }
    return fileId
  }

  async getStickerSet(setName: string) {
    return await this.api.getStickerSet({ name: setName })
  }

  sendMediaGroupTenByTen = async (chatId: any, images: any[], options = {}) => {
    const chunkedImages = images.reduce((acc: any[][], cur: any, i: number) => {
      if (i % 10 === 0) {
        acc.push([cur])
      } else {
        acc[acc.length - 1].push(cur)
      }
      return acc
    }, [])

    for (const chunk of chunkedImages) {
      await this.api.sendMediaGroup({
        chat_id: chatId,
        media: chunk,
        ...options
      })
    }
  }

  sendDocumentOnebyOne = async (chatId: any, documents: any[], options = {}) => {
    const promises = documents.map(async (document: any) => {
      await this.sendDocument(chatId, document, options)
    })
    await Promise.all(promises)
  }

  findCommand(str: string) {
    const cmd = Array.from(this.commands).find(([expreg]: any) => expreg.test(str))
    if (typeof cmd === 'undefined') {
      return [false, []]
    }
    return [true, cmd]
  }

  getCommands() {
    return Array.from(this.commands)
  }

  async loadCommands() {
    console.log(`(${process.env.TELEGRAM_PREFIX}) Cargando comandos`.yellow)
    this.commands.clear()
    const RUTA_ARCHIVOS = await this.utils.loadFiles('command')

    if (RUTA_ARCHIVOS.length) {
      for (const rutaArchivo of RUTA_ARCHIVOS) {
        try {
          const mod = await import(pathToFileURL(rutaArchivo).href)
          const COMANDO = mod.default || mod
          const NOMBRE_COMANDO = rutaArchivo
            .split('\\')
            .pop()!
            .split('/')
            .pop()!
            .split('.')
            .shift()
          if (NOMBRE_COMANDO && 'active' in COMANDO) {
            if (COMANDO.active) console.log(`Cargando comando: ${NOMBRE_COMANDO}`)
            if (COMANDO.active) this.commands.set(COMANDO.ExpReg, COMANDO)
          }
        } catch (e) {
          console.log(`ERROR AL CARGAR EL COMANDO ${rutaArchivo}`.bgRed)
        }
      }
      console.log(
        `(${process.env.TELEGRAM_PREFIX}) ${this.commands.size}  Comandos cargados`
          .green
      )
    }
  }

  async loadCommandsSlash() {
    console.log('(%) Cargando Comandos Slash'.yellow)
    this.slashArray = []
    const RUTA_ARCHIVOS = await this.utils.loadFiles('commandSlash')

    if (RUTA_ARCHIVOS.length) {
      for (const rutaArchivo of RUTA_ARCHIVOS) {
        try {
          const mod = await import(pathToFileURL(rutaArchivo).href)
          const COMANDO = mod.default || mod
          this.slashArray.push(...(Array.isArray(COMANDO) ? COMANDO : [COMANDO]))
          console.log(`(/) ${COMANDO.length || 1} Comandos Slash Cargados`.green)
        } catch (e) {
          console.log({ e })
          console.log(`(/) ERROR AL CARGAR EL COMANDO ${rutaArchivo}`.bgRed)
        }
      }
      if (this.slashArray.length && this.api?.setMyCommands) {
        await this.api.setMyCommands({ commands: this.slashArray })
      }
    }
  }

  async loadHandlers() {
    console.log('(%) Cargando handlers'.yellow)
    const RUTA_ARCHIVOS = await this.utils.loadFiles('handlers')

    if (RUTA_ARCHIVOS.length) {
      for (const rutaArchivo of RUTA_ARCHIVOS) {
        try {
          const mod = await import(pathToFileURL(rutaArchivo).href)
          const handlerFn = mod.default || mod
          if (typeof handlerFn === 'function') {
            handlerFn(this)
          }
        } catch (e) {
          console.log(`ERROR AL CARGAR EL HANDLER ${rutaArchivo}`.bgRed)
        }
      }
    }

    console.log(`(-) ${RUTA_ARCHIVOS.length} Handlers Cargados`.green)
  }

  async loadEvents() {
    console.log('(%) Cargando eventos'.yellow)
    const RUTA_ARCHIVOS = await this.utils.loadFiles('events')

    if (RUTA_ARCHIVOS.length) {
      for (const rutaArchivo of RUTA_ARCHIVOS) {
        try {
          const mod = await import(pathToFileURL(rutaArchivo).href)
          const EVENTO = mod.default || mod
          const NOMBRE_EVENTO = rutaArchivo
            .split('\\')
            .pop()!
            .split('/')
            .pop()!
            .split('.')
            .shift()
          if (NOMBRE_EVENTO && typeof EVENTO === 'function') {
            this.on(NOMBRE_EVENTO as any, (ctx: any) => {
              const msg = ctx.message || ctx.callbackQuery || ctx.inlineQuery || ctx.msg || ctx
              EVENTO(this, msg)
            })
          }
        } catch (e) {
          console.log(e)
          console.log(`ERROR AL CARGAR EL EVENTO ${rutaArchivo}`.bgRed)
        }
      }
    }

    console.log(`(+) ${RUTA_ARCHIVOS.length} Eventos Cargados`.green)
  }

  async start() {
    await this.loadEvents()
    await this.loadHandlers()
    await this.loadCommands()
  }
}

export default async function createBot() {
  const client = new Client()
  await client.start()
  client.getMe().then(function (me: any) {
    console.log(
      `[Telegram] Telegram connection established. Logged in as: https://t.me/${me.username}`
        .rainbow
    )
  }).catch(() => {})
  return client
}
