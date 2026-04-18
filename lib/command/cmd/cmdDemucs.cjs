const axios = require('axios')
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { configEnv: { USERNAME_BOT } } = require('../../helpers/Helpers.cjs')

/**
 * Descarga un archivo de audio desde una URL
 * @param {string} url - URL del archivo a descargar
 * @param {string} filePath - Ruta donde se guardará el archivo
 * @returns {Promise<void>}
 */
function downloadAudio (url, filePath) {
  return axios({
    url,
    method: 'GET',
    responseType: 'stream'
  }).then(response =>
    new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filePath)
      response.data.pipe(writer)
      writer.on('finish', () => resolve())
      writer.on('error', reject)
    })
  )
}

/**
 * Ejecuta demucs para separar voces e instrumental
 * @param {string} inputFile - Ruta del archivo de entrada
 * @param {string} outputDir - Directorio de salida
 * @returns {Promise<{stdout: string, stderr: string, success: boolean}>}
 */
function runDemucs (inputFile, outputDir) {
  return new Promise((resolve, reject) => {
    const process = spawn('python3', [
      '-m', 'demucs.separate',
      '--two-stems', 'vocals',
      '--mp3', inputFile,
      '-o', outputDir
    ])

    let stdout = ''
    let stderr = ''

    process.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    process.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    process.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, success: true })
      } else {
        reject(new Error(stderr || `Process exited with code ${code}`))
      }
    })

    process.on('error', (err) => {
      reject(err)
    })
  })
}

/**
 * Comando para separar voces de instrumental usando Demucs
 *用法: Responder a un audio/voice con /demucs
 */
module.exports = {
  active: true,
  ExpReg: new RegExp(`^/demucs(?:@${USERNAME_BOT})?$`, 'im'),
  /**
   * @param {import('node-telegram-bot-api')} client
   * @param {import('node-telegram-bot-api').Message} msg
   */
  async cmd (client, msg) {
    const { chat: { id: chatId }, reply_to_message: replyMsg } = msg

    if (!replyMsg) {
      return client.sendMessage(
        chatId,
        'Este comando funciona respondiendo a un audio o voz.\nEnviame un audio y luego responde /demucs al audio.'
      )
    }

    const audio = replyMsg.audio || replyMsg.voice
    if (!audio) {
      return client.sendMessage(
        chatId,
        'No se detectó ningún audio. Responde a un audio o nota de voz.'
      )
    }

    const loadingMsg = await client.sendMessage(chatId, '⏳ Descargando audio...')

    const tmpDir = './tmp'
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true })
    }

    try {
      const timestamp = Date.now()
      const ext = audio.file_name 
        ? audio.file_name.split('.').pop() 
        : (audio.mime_type ? audio.mime_type.split('/')[1] : 'mp3')
      const safeName = (audio.file_name || 'audio').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/\.[^.]+$/, '')
      const inputFile = path.join(tmpDir, `demucs_${timestamp}_${safeName}.${ext}`)

      const fileLink = await client.getFileLink(audio.file_id)
      await downloadAudio(fileLink, inputFile)

      const outputDir = `./tmp/demucs_output_${timestamp}`
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      let startTime = Date.now()
      let updateInterval

      const updateProgress = async () => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        await client.editMessageText(`🎵 Separando voces con Demucs... (${elapsed}s)`, {
          chat_id: chatId,
          message_id: loadingMsg.message_id
        }).catch(() => {})
      }

      updateInterval = setInterval(updateProgress, 5000)
      await updateProgress()

      const result = await runDemucs(inputFile, outputDir)

      clearInterval(updateInterval)

      const totalTime = Math.floor((Date.now() - startTime) / 1000)

      if (!result.success) {
        throw new Error(result.stderr || 'Error al ejecutar Demucs')
      }

      const trackName = path.basename(inputFile, path.extname(inputFile))
      const vocalsPath = path.join(outputDir, 'htdemucs', trackName, 'vocals.mp3')
      const noVocalsPath = path.join(outputDir, 'htdemucs', trackName, 'no_vocals.mp3')

      if (!fs.existsSync(vocalsPath) || !fs.existsSync(noVocalsPath)) {
        throw new Error('No se encontraron los archivos de salida')
      }

      await client.sendMessage(chatId, `✅ ¡Listo! Enviando archivos... (${totalTime}s)`)

      await client.sendAudio(chatId, vocalsPath, { caption: '🎤 Voces' })
      await client.sendAudio(chatId, noVocalsPath, { caption: '🎵 Instrumental (sin voces)' })

      await client.deleteMessage(chatId, loadingMsg.message_id)

      fs.unlinkSync(inputFile)
      fs.rmSync(outputDir, { recursive: true, force: true })

    } catch (error) {
      console.error('Error Demucs:', error.message)
      await client.sendMessage(chatId, `❌ Error: ${error.message}`)
      if (loadingMsg?.message_id) {
        client.deleteMessage(chatId, loadingMsg.message_id).catch(() => {})
      }
    }
  }
}
