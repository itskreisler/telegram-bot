import axios from 'axios'
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { InputFile } from 'node-telegram-bot-api'
import type { ClientBot } from '../../core/main.js'
import type { Message } from '../../interfaces/cls.message.js'
import { BOT_USERNAME, TELEGRAM_TOKEN_DEV, TELEGRAM_TOKEN_PROD, NODE_ENV } from '../../helpers/Helpers.js'

const botToken = NODE_ENV === 'production' ? TELEGRAM_TOKEN_PROD : TELEGRAM_TOKEN_DEV

interface DemucsResult { stdout: string; stderr: string; success: boolean }

function downloadAudio(url: string, filePath: string): Promise<void> {
    return axios({ url, method: 'GET', responseType: 'stream' }).then(async (response) => {
        await new Promise<void>((resolve, reject) => {
            response.data.pipe(fs.createWriteStream(filePath)).on('finish', resolve).on('error', reject)
        })
    })
}

function runDemucs(inputFile: string, outputDir: string): Promise<DemucsResult> {
    return new Promise<DemucsResult>((resolve, reject) => {
        const process = spawn('python3', ['-m', 'demucs.separate', '--two-stems', 'vocals', '--mp3', inputFile, '-o', outputDir])
        let stdout = ''
        let stderr = ''
        process.stdout.on('data', (data: Buffer) => { stdout += data.toString() })
        process.stderr.on('data', (data: Buffer) => { stderr += data.toString() })
        process.on('close', (code) => code === 0 ? resolve({ stdout, stderr, success: true }) : reject(new Error(stderr || `Process exited with code ${code}`)))
        process.on('error', reject)
    })
}

export default {
    active: false,
    regexp: new RegExp(`^/demucs(?:@${BOT_USERNAME})?$`, 'im'),
    async cmd(client: ClientBot, message: Message) {
        const replied = message.getQuotedMsg()
        const audio = replied?.audio ?? replied?.voice
        if (!audio) {
            await message.reply('Este comando funciona respondiendo a un audio o voz.')
            return
        }

        const loading = await message.reply('Descargando audio...')
        const tmpDir = './tmp'
        fs.mkdirSync(tmpDir, { recursive: true })
        const timestamp = Date.now()
        const inputFile = path.join(tmpDir, `demucs_${timestamp}.mp3`)
        const outputDir = path.join(tmpDir, `demucs_output_${timestamp}`)

        try {
            const file = await client.api.getFile({ file_id: audio.file_id })
            if (!file.file_path) throw new Error('No se encontro el archivo de audio')
            await downloadAudio(`https://api.telegram.org/file/bot${botToken}/${file.file_path}`, inputFile)
            fs.mkdirSync(outputDir, { recursive: true })
            await loading.editText('Separando voces con Demucs...')
            const result = await runDemucs(inputFile, outputDir)
            if (!result.success) throw new Error(result.stderr || 'Error al ejecutar Demucs')

            const trackName = path.basename(inputFile, path.extname(inputFile))
            const vocalsPath = path.join(outputDir, 'htdemucs', trackName, 'vocals.mp3')
            const instrumentalPath = path.join(outputDir, 'htdemucs', trackName, 'no_vocals.mp3')
            if (!fs.existsSync(vocalsPath) || !fs.existsSync(instrumentalPath)) throw new Error('No se encontraron los archivos de salida')

            await loading.editText('Enviando archivos...')
            await client.api.sendAudio({ chat_id: message.chatId, audio: new InputFile(new Uint8Array(fs.readFileSync(vocalsPath)), { filename: 'vocals.mp3' }), caption: 'Voces' })
            await client.api.sendAudio({ chat_id: message.chatId, audio: new InputFile(new Uint8Array(fs.readFileSync(instrumentalPath)), { filename: 'instrumental.mp3' }), caption: 'Instrumental' })
            await loading.delete()
        } catch (error) {
            console.error('Error Demucs:', error)
            await loading.delete().catch(() => false)
            await message.reply('Ha ocurrido un error al separar el audio.')
        } finally {
            fs.rmSync(inputFile, { force: true })
            fs.rmSync(outputDir, { recursive: true, force: true })
        }
    }
}
