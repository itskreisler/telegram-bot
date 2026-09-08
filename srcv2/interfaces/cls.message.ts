import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import type {
    DeleteMessageParams,
    EditMessageTextParams,
    InputFile,
    Message as TelegramMessage,
    SendAudioParams,
    SendDocumentParams,
    SendMessageParams,
    SendPhotoParams,
    SendVideoParams
} from 'node-telegram-bot-api'
import type { ClientBot } from '../core/main.js'
import { NODE_ENV, TELEGRAM_TOKEN_DEV, TELEGRAM_TOKEN_PROD } from '../helpers/Helpers.js'
import { EChatType } from './constants.js'

const botToken = NODE_ENV === 'production' ? TELEGRAM_TOKEN_PROD : TELEGRAM_TOKEN_DEV

export type MessageContent =
    | { text: string; options?: Omit<SendMessageParams, 'chat_id' | 'text'> }
    | { document: InputFile | string; options?: Omit<SendDocumentParams, 'chat_id' | 'document'> }
    | { photo: InputFile | string; options?: Omit<SendPhotoParams, 'chat_id' | 'photo'> }
    | { video: InputFile | string; options?: Omit<SendVideoParams, 'chat_id' | 'video'> }
    | { audio: InputFile | string; options?: Omit<SendAudioParams, 'chat_id' | 'audio'> }

type DownloadMode = 'path' | 'buffer' | 'stream' | 'all'

export interface DownloadedMedia {
    path: string
    buffer: Buffer
    stream: Readable
    fileLink: string
}

export class Message {
    protected readonly data: TelegramMessage
    readonly client: ClientBot
    readonly chatId: number | string
    readonly message_id: number
    readonly text: string | undefined
    readonly isReply: boolean
    readonly isGroup: boolean
    readonly isChannel: boolean

    constructor(client: ClientBot, data: TelegramMessage) {
        this.client = client
        this.data = data
        this.text = data.text
        this.chatId = data.chat.id
        this.message_id = data.message_id
        this.isReply = data.reply_to_message !== undefined
        this.isGroup = data.chat.type === EChatType.Group || data.chat.type === EChatType.SuperGroup
        this.isChannel = data.chat.type === EChatType.Channel
    }

    getData(): TelegramMessage {
        return this.data
    }

    async send(content: MessageContent): Promise<Message> {
        const message = 'text' in content
            ? await this.client.api.sendMessage({ chat_id: this.chatId, text: content.text, ...content.options })
            : 'document' in content
                ? await this.client.api.sendDocument({ chat_id: this.chatId, document: content.document, ...content.options })
                : 'photo' in content
                    ? await this.client.api.sendPhoto({ chat_id: this.chatId, photo: content.photo, ...content.options })
                    : 'video' in content
                        ? await this.client.api.sendVideo({ chat_id: this.chatId, video: content.video, ...content.options })
                        : await this.client.api.sendAudio({ chat_id: this.chatId, audio: content.audio, ...content.options })
        return new Message(this.client, message)
    }

    async reply(text: string, options: Omit<SendMessageParams, 'chat_id' | 'text'> = {}): Promise<Message> {
        const message = await this.client.api.sendMessage({
            chat_id: this.chatId,
            text,
            ...options,
            reply_parameters: { message_id: this.message_id }
        })
        return new Message(this.client, message)
    }

    async delete(): Promise<boolean> {
        const params: DeleteMessageParams = { chat_id: this.chatId, message_id: this.message_id }
        return await this.client.api.deleteMessage(params)
    }

    async editText(text: string, options: Omit<EditMessageTextParams, 'chat_id' | 'message_id' | 'text'> = {}) {
        return await this.client.api.editMessageText({
            chat_id: this.chatId,
            message_id: this.message_id,
            text,
            ...options
        })
    }

    async downloadMedia(mode: DownloadMode = 'path', outputDir = './tmp'): Promise<string | Buffer | Readable | DownloadedMedia | null> {
        const media = this.data.document ?? this.data.video ?? this.data.audio ?? this.data.photo?.at(-1)
        if (!media) return null

        const file = await this.client.api.getFile({ file_id: media.file_id })
        if (!file.file_path) return null

        const fileLink = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`
        const response = await fetch(fileLink)
        if (!response.ok) throw new Error(`No se pudo descargar el archivo: ${response.status}`)

        const buffer = Buffer.from(await response.arrayBuffer())
        if (mode === 'buffer') return buffer
        const stream = Readable.from(buffer)
        if (mode === 'stream') return stream

        await mkdir(outputDir, { recursive: true })
        const filePath = path.join(outputDir, path.basename(file.file_path))
        await writeFile(filePath, buffer)
        if (mode === 'all') return { path: filePath, buffer, stream, fileLink }
        return filePath
    }

    getQuotedMsg(): TelegramMessage | undefined {
        return this.data.reply_to_message
    }
}
