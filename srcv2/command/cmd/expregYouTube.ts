import { create } from 'youtube-dl-exec'
import { glob } from 'glob'
import fs from 'node:fs'
import { readFile } from 'node:fs/promises'
import { InputFile, type InlineKeyboardMarkup } from 'node-telegram-bot-api'
import type { ClientBot } from '../../core/main.js'
import type { Message } from '../../interfaces/cls.message.js'

const exec = create('yt-dlp')
const VIDEO_TYPES = Object.freeze({ embed: 'embed', shorts: 'shorts' })
const qualities = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault']
const tempDir = './tmp/'

function getVideoIdFromUrl(text: string): string {
    const { searchParams, pathname } = new URL(text)
    const queryId = searchParams.get('v')
    if (queryId) return queryId
    const pathParts = pathname.split('/')
    if (pathParts.includes(VIDEO_TYPES.embed) || pathParts.includes(VIDEO_TYPES.shorts)) return pathParts[2]
    return pathParts[1]
}

function thumbnailUrl(text: string, quality: string): string {
    return `https://img.youtube.com/vi/${getVideoIdFromUrl(text)}/${quality}.jpg`
}

async function loadFiles(directory: string): Promise<string[]> {
    const pattern = `${process.cwd().replace(/\\/g, '/')}/${directory}/!(*.test*).{mp3,flac}`
    return await glob(pattern)
}

export default {
    active: true,
    regexp: /(?:https?:)?(?:\/\/)?(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*?[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/gim,
    async cmd(_client: ClientBot, message: Message, match: RegExpMatchArray | null) {
        const youtubeUrl = match?.[0] ?? message.text
        if (!youtubeUrl) return

        const markup: InlineKeyboardMarkup = {
            inline_keyboard: [
                ...qualities.map((quality) => [{ text: quality, url: thumbnailUrl(youtubeUrl, quality) }]),
                [{ text: 'Descargar Video', callback_data: `yt_video|${youtubeUrl}` }]
            ]
        }
        await message.reply('Miniatura del video', { reply_markup: markup })

        const outputDir = `${tempDir}${Date.now()}`
        fs.mkdirSync(outputDir, { recursive: true })
        const loading = await message.reply('Comenzando descarga...')
        const ytFlags = {
            audioQuality: 0,
            extractAudio: true,
            audioFormat: 'mp3',
            output: `${outputDir}/%(title)s.%(ext)s`,
            addMetadata: true,
            embedThumbnail: true,
            noPlaylist: true,
            cookies: 'a.txt',
            update: true,
            jsRuntimes: 'node:node' as const,
            extractorArgs: 'youtube:player-client=default,-web_safari',
            remoteComponents: 'ejs:github'
        }

        try {
            await loading.editText('Descargando audio...')
            await exec(youtubeUrl, ytFlags)
            const [audioPath] = await loadFiles(outputDir)
            await loading.editText('Subiendo audio...')
            if (audioPath) {
                const audio = new InputFile(new Uint8Array(await readFile(audioPath)), { filename: audioPath.split(/[\\/]/).pop() })
                await loading.send({ audio, options: { caption: 'Audio descargado desde YouTube' } })
            }
            await loading.delete()
            fs.rmSync(outputDir, { recursive: true, force: true })
        } catch (error) {
            await loading.delete().catch(() => false)
            await message.reply('Ahora mismo este comando no esta disponible, lamentamos las molestias.')
            fs.rmSync(outputDir, { recursive: true, force: true })
            console.error(error)
        }
    }
}
