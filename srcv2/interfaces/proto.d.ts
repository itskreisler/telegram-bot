import { type Message } from '@/bot/interfaces/cls.message'
import { type ClientBot } from '@/bot/core/main'
import type TelegramBot from 'node-telegram-bot-api'
import { type Readable } from 'stream'

declare namespace IClsBot {
  interface ICTX {
    msg: TelegramBot.Message
    ctx: Message
  }
  interface IExportCMD {
    active: boolean
    regexp: RegExp
    cmd: (client: ClientBot, context: ICTX, match: RegExpMatchArray | null) => Promise<void>
  }
  interface IImportCMD {
    default: IExportCMD
  }
  type TImportEvent = (client: ClientBot, msg: TelegramBot.Message) => Promise<void>

  interface IDebounceParams { client: ClientBot, msg: TelegramBot.Message, comando: IClsBot.IExportCMD, ExpReg: RegExp }

  //
  type AtLeastOne<T, K extends keyof T = keyof T> =
    K extends keyof T
    ? Required<Pick<T, K>> & Partial<Omit<T, K>>
    : never

  type TSendContent = AtLeastOne<{
    text?: string
    doc?: string | Readable | Buffer
    photo?: string | Readable | Buffer
    video?: string | Readable | Buffer
    sticker?: string | Readable | Buffer
    audio?: string | Readable | Buffer
  }>
  //
}
