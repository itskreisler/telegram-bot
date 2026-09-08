import { Bot as TelegramBot, type BotCommand, type ChatId, type Context, type InputFile, type InputMedia, type Message as TelegramMessage, type SendDocumentParams, type SendMediaGroupParams, type SetMyCommandsParams } from 'node-telegram-bot-api'
import { TELEGRAM_TOKEN_DEV, TELEGRAM_TOKEN_PROD, NODE_ENV } from '../helpers/Helpers.js'
import type { Message } from '../interfaces/cls.message.js'

const TOKEN = NODE_ENV === 'production' ? TELEGRAM_TOKEN_PROD : TELEGRAM_TOKEN_DEV

type Command = {
    active: boolean
    regexp?: RegExp
    ExpReg?: RegExp
    OWNER?: boolean
    cmd: (bot: ClientBot, message: Message, match: RegExpMatchArray | null) => Promise<void>
}

type DynamicModule = Record<string, unknown> & { default?: unknown }
type EventHandler = (client: ClientBot, context: Context) => Promise<void>
type CommandModule = { default?: Partial<Command> & Record<string, unknown> }

export class ClientBot extends TelegramBot {
    commands = new Map<RegExp, Command>()
    slashArray: BotCommand[] = []

    constructor(
        token = TOKEN,
        options: ConstructorParameters<typeof TelegramBot>[1] = {}
    ) {
        super(token, options)
        this.api.getMe().then((me) => {
            console.log(`✅ [Telegram] Logged in as: https://t.me/${me.username ?? 'unknown'}`)
        })
    }

    get Bot() {
        return this
    }

    async sendMediaGroupTenByTen(
        chatId: ChatId,
        medias: readonly InputMedia[],
        options?: Omit<SendMediaGroupParams, 'chat_id' | 'media'>
    ): Promise<TelegramMessage[]> {
        const chunks = medias.reduce<InputMedia[][]>((acc, media, index) => {
            if (index % 10 === 0) acc.push([media])
            else acc[acc.length - 1].push(media)
            return acc
        }, [])

        const results = await Promise.all(chunks.map((media) => this.api.sendMediaGroup({
            chat_id: chatId,
            media,
            ...options
        })))
        return results.flat()
    }

    async sendDocumentOnebyOne(
        chatId: ChatId,
        documents: Array<InputFile | string>,
        options?: Omit<SendDocumentParams, 'chat_id' | 'document'>
    ) {
        return await Promise.all(documents.map((document) => this.api.sendDocument({
            chat_id: chatId,
            document,
            ...options,
        })))
    }

    async initialize() {
        await this.loadEvents()
        await this.loadHandlers()
        await this.loadCommands()
        await this.startPolling()
    }

    get getCommands(): [RegExp, Command][] {
        return Array.from(this.commands)
    }

    findCommand(text: string): [boolean, [RegExp, Command] | []] {
        const command = this.getCommands.find(([regexp]) => regexp.test(text))
        return command === undefined ? [false, []] : [true, command]
    }

    async dynamicImport<O>(modulePath: string): Promise<O> {
        return await import(modulePath) as O
    }

    async loadEvents() {
        console.log('📗(%) Cargando eventos')
        const events = [{ event: 'message', path: '../events/client/message.js' }]

        for (const { event, path } of events) {
            try {
                const module = await this.dynamicImport<{ default?: EventHandler; handler?: EventHandler }>(path)
                const handler = module.handler ?? module.default
                if (typeof handler === 'function') {
                    this.on(event as 'message', (context) => handler(this, context))
                }
            } catch (error) {
                console.error(`Error cargando evento ${event}`, error)
            }
        }
        console.log('📚(%) Eventos cargados')
    }

    async loadCommands() {
        console.log('📗(%) Cargando comandos')
        const commands = [
            '../command/cmd/cmdPing.js',
            '../command/cmd/cmdDonate.js',
            '../command/cmd/cmdStart.js',
            '../command/cmd/cmdUpTime.js',
            '../command/cmd/cmdRestart.js',
            '../command/cmd/cmdWhatIf.js',
            '../command/cmd/cmdStw.js',
            '../command/cmd/expregTikTok.js',
            '../command/cmd/expregYouTube.js',
            '../command/cmd/cmdDemucs.js',
            '../command/cmd/cmdSticker.js',
            '../command/admin/reload.js'
        ]
        for (const modulePath of commands) {
            const module = await this.dynamicImport<CommandModule>(modulePath)
            const command = module.default
            const regexp = command?.regexp ?? command?.ExpReg
            if (command && command.active !== false && regexp instanceof RegExp && typeof command.cmd === 'function') {
                this.commands.set(regexp, { ...command, active: command.active ?? true, regexp, cmd: command.cmd })
            }
        }
        console.log('📚(%) Comandos cargados', commands.length)
    }

    async loadCommandsSlash() {
        console.log('📗(%) Cargando comandos slash')
        if (this.slashArray.length) {
            const params: SetMyCommandsParams = { commands: this.slashArray }
            await this.api.setMyCommands(params)
        }
        console.log('📚(%) Comandos slash cargados correctamente')
    }

    async loadHandlers() {
        console.log('📗(%) Cargando manejadores')
        const handlers = ['../handlers/antiCrash.js']
        for (const modulePath of handlers) {
            const module = await this.dynamicImport<{ default?: () => void }>(modulePath)
            const handler = module.default
            if (typeof handler === 'function') handler()
        }
    }
}

export function dateNow(): string {
    return new Date().toLocaleString()
}
