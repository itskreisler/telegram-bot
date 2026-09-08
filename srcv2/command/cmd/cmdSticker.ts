import axios from 'axios'
import { createWriteStream } from 'node:fs'
import { mkdir, readFile, unlink } from 'node:fs/promises'
import path from 'node:path'
import { ZipArchive } from 'archiver'
import { InputFile } from 'node-telegram-bot-api'
import type { ClientBot } from '../../core/main.js'
import type { Message } from '../../interfaces/cls.message.js'
import { BOT_USERNAME, TELEGRAM_TOKEN_DEV, TELEGRAM_TOKEN_PROD, NODE_ENV } from '../../helpers/Helpers.js'

const botToken = NODE_ENV === 'production' ? TELEGRAM_TOKEN_PROD : TELEGRAM_TOKEN_DEV

async function downloadFile(url: string, filePath: string): Promise<void> {
    const response = await axios({ url, method: 'GET', responseType: 'stream' })
    await new Promise<void>((resolve, reject) => {
        response.data.pipe(createWriteStream(filePath)).on('finish', resolve).on('error', reject)
    })
}

export default {
    active: true,
    regexp: new RegExp(`^/st(?:ickers)?(?:@${BOT_USERNAME})?$`, 'im'),
    async cmd(client: ClientBot, message: Message) {
        const quotedMessage = message.getQuotedMsg()
        if (!quotedMessage) {
            await message.reply('Este comando solo funciona respondiendo a un sticker.\nEnviame un sticker y luego responde /stickers al sticker.')
            return
        }

        const sticker = quotedMessage.sticker
        if (!sticker) {
            await message.reply('El mensaje respondido no contiene un sticker.')
            return
        }

        const setName = sticker.set_name
        if (!setName) {
            await message.reply('Este sticker no pertenece a un paquete descargable.')
            return
        }

        const loading = await message.reply('Descargando stickers, espera un momento...')
        const tempDir = './temp'
        await mkdir(tempDir, { recursive: true })

        try {
            const stickerSet = await client.api.getStickerSet({ name: setName })
            const downloadedFiles = await Promise.all(stickerSet.stickers.map(async (item) => {
                const file = await client.api.getFile({ file_id: item.file_id })
                if (!file.file_path) throw new Error(`No se encontro la ruta del sticker ${item.file_id}`)
                const fileName = path.basename(file.file_path)
                const filePath = path.join(tempDir, `${setName}_${fileName}`)
                await downloadFile(`https://api.telegram.org/file/bot${botToken}/${file.file_path}`, filePath)
                return { filePath, fileName }
            }))

            const zipFilePath = path.join(tempDir, `${setName}.zip`)
            const output = createWriteStream(zipFilePath)
            const archive = new ZipArchive({ zlib: { level: 9 } })
            archive.pipe(output)
            downloadedFiles.forEach(({ filePath, fileName }) => archive.file(filePath, { name: fileName }))
            await archive.finalize()
            await new Promise<void>((resolve, reject) => output.on('close', resolve).on('error', reject))

            const zip = new InputFile(new Uint8Array(await readFile(zipFilePath)), { filename: `${setName}.zip` })
            await client.api.sendDocument({ chat_id: message.chatId, document: zip })
            await message.reply(`http://t.me/addstickers/${setName}`)
            await loading.delete()
            await Promise.all([...downloadedFiles.map(({ filePath }) => unlink(filePath)), unlink(zipFilePath)])
        } catch (error) {
            console.error('Error descargando stickers:', error)
            await loading.delete().catch(() => false)
            await message.reply('Ha ocurrido un error al descargar el paquete de stickers.')
        }
    }
}
