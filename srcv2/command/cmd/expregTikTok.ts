import https from 'node:https'
import { InputFile, type InlineKeyboardMarkup, type InputMedia } from 'node-telegram-bot-api'
import type { ClientBot } from '../../core/main.js'
import type { Message } from '../../interfaces/cls.message.js'
import { abbreviateNumber, converterMb, isNull, ParseMode, validateDomainTikTok } from '../../helpers/Helpers.js'
import { apiTikWm } from '../../services/tiktok.service.js'

const SUCCESS = 0
const ERROR = -1
const parseMode = ParseMode.Markdown

interface TikTokData {
    title: string | null
    author: { unique_id: string }
    play_count: number
    digg_count: number
    comment_count: number
    share_count: number
    download_count: number
    images?: string[]
    [key: string]: unknown
}

interface DownloadButton {
    type: 'mp4' | 'mp3' | 'webp'
    title: string
    quality: string
    size: string | null
}

function downloadBuffer(url: string): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                downloadBuffer(response.headers.location).then(resolve, reject)
                return
            }
            const chunks: Buffer[] = []
            response.on('data', (chunk: Buffer) => chunks.push(chunk))
            response.on('end', () => resolve(new Uint8Array(Buffer.concat(chunks))))
            response.on('error', reject)
        }).on('error', reject)
    })
}

function numberValue(value: unknown): number {
    return typeof value === 'number' ? value : 0
}

export default {
    active: true,
    regexp: /(https?:\/\/((?:www\.)?|(?:vm\.)?|(?:vt\.)?|(?:m\.)?)tiktok\.com\/(?:@[a-zA-Z0-9_]+\/)?(?:video\/)?([a-zA-Z0-9]+))/im,
    async cmd(client: ClientBot, message: Message, match: RegExpMatchArray | null) {
        const url = match?.[0] ?? message.text
        if (!url || !validateDomainTikTok(url)) return

        const loading = await message.reply('Enviando...')
        try {
            const response = await apiTikWm(url)
            const data = response.data as unknown as TikTokData
            if (response.code === ERROR) {
                await message.reply(`_${response.msg}_`, { parse_mode: parseMode })
                return
            }
            if (response.code !== SUCCESS) return

            const globalText = `_ 👁️${abbreviateNumber(numberValue(data.play_count))} ❤️${abbreviateNumber(numberValue(data.digg_count))} 💬${abbreviateNumber(numberValue(data.comment_count))} 🔁${abbreviateNumber(numberValue(data.share_count))} 📥${abbreviateNumber(numberValue(data.download_count))}_\n${isNull(data.title) ? `by [${data.author.unique_id}](https://www.tiktok.com/@${data.author.unique_id})` : `${data.title}\nby [${data.author.unique_id}](https://www.tiktok.com/@${data.author.unique_id})`}`

            if (data.images && data.images.length > 0) {
                const media: InputMedia[] = data.images.map((image, index) => ({ type: 'photo', media: image, caption: `Photo ${index + 1}` }))
                await client.sendMediaGroupTenByTen(message.chatId, media)
                await message.reply(globalText, { parse_mode: parseMode })
                return
            }

            const value = (key: string): string => {
                const item = data[key]
                return typeof item === 'string' ? `${response.domain}${item}` : ''
            }
            const buttons: DownloadButton[] = [
                { type: 'mp4', title: 'No Watermark', quality: 'play', size: 'size' },
                { type: 'mp4', title: 'No Watermark(HD)', quality: 'hdplay', size: 'hd_size' },
                { type: 'mp4', title: 'Watermark', quality: 'wmplay', size: 'wm_size' },
                { type: 'mp3', title: 'Music', quality: 'music', size: null },
                { type: 'webp', title: 'Cover', quality: 'cover', size: null }
            ]
            const markup: InlineKeyboardMarkup = {
                inline_keyboard: buttons.map(({ type, title, quality, size }) => [{
                    text: type === 'mp4' && size && typeof data[size] === 'number'
                        ? `${title} .${type} (${converterMb(data[size] as number)}MB)`
                        : `${title} .${type}`,
                    url: value(quality)
                }])
            }

            try {
                await client.api.sendVideo({ chat_id: message.chatId, video: value('hdplay'), caption: globalText, reply_markup: markup, parse_mode: parseMode })
            } catch {
                try {
                    await client.api.sendVideo({ chat_id: message.chatId, video: value('play'), caption: globalText, reply_markup: markup })
                } catch {
                    try {
                        await client.api.sendPhoto({ chat_id: message.chatId, photo: value('cover'), caption: globalText, reply_markup: markup })
                    } catch {
                        const cover = new InputFile(await downloadBuffer(value('cover')), { filename: 'cover.webp' })
                        await client.api.sendPhoto({ chat_id: message.chatId, photo: cover, caption: globalText, reply_markup: markup })
                    }
                }
            }
        } catch (error) {
            console.error(`ExpRegTikTok: ${String(error)}`)
            await message.reply('Ha ocurrido un error al procesar el enlace de TikTok.')
        } finally {
            await loading.delete().catch(() => false)
        }
    }
}
