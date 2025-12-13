const { exec } = require('child_process')
const { promisify } = require('util')
const { glob } = require('glob')
const fs = require('fs')
const path = require('path')

const execAsync = promisify(exec)

/**
 * Carga archivos de audio desde un directorio
 * @param {string} dirName - Directorio a buscar
 * @returns {Promise<string[]>} Array de rutas de archivos
 */
async function loadFiles (dirName) {
  const patternGlob = `${process.cwd().replace(/\\/g, '/')}/${dirName}/!(*.test*).{mp3,flac}`
  const files = await glob(patternGlob)
  return files
}

const tempDir = './tmp/'

module.exports = {
  active: true,
  ExpReg: /https:\/\/open\.spotify\.com\/(intl-[a-z]+\/)?(track|playlist|album)\/[a-zA-Z0-9]+(\?[^\s]*)?/gi,
  
  /**
   * Comando para descargar música de Spotify
   * @param {import('node-telegram-bot-api')} bot
   * @param {import('node-telegram-bot-api').Message} msg
   * @param {string[]} match
   */
  async cmd (bot, { chat: { id: chatId }, text }, match) {
    const outputDir = tempDir.concat(Date.now())
    const spotifyUrl = match[0]
    
    // Crear directorio temporal
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const sms = await bot.sendMessage(chatId, '🎵 Procesando enlace de Spotify...')
    
    const optionsEdits = {
      chat_id: chatId,
      message_id: sms.message_id
    }

    try {
      // Ejecutar el script spotify-dl.sh
      const scriptPath = path.join(process.cwd(), 'spotify-dl.sh')
      
      bot.editMessageText('🔍 Buscando canciones en YouTube Music...', optionsEdits)
      
      const { stdout, stderr } = await execAsync(
        `bash "${scriptPath}" "${spotifyUrl}" "${outputDir}"`,
        { maxBuffer: 1024 * 1024 * 10 } // 10MB buffer
      )

      // Verificar si hubo errores críticos
      if (stderr && stderr.includes('Error:')) {
        throw new Error(stderr)
      }

      // Cargar archivos descargados
      const audioFiles = await loadFiles(outputDir)

      if (audioFiles.length === 0) {
        await bot.editMessageText('❌ No se encontraron canciones para descargar', optionsEdits)
        fs.rmSync(outputDir, { recursive: true, force: true })
        return
      }

      // Determinar si es una sola canción o varias
      if (audioFiles.length === 1) {
        bot.editMessageText('⬆️ Subiendo audio...', optionsEdits)
        await bot.sendAudio(chatId, audioFiles[0], { 
          caption: '🎵 Audio descargado desde Spotify'
        })
      } else {
        // Para playlists/albums, enviar cada canción
        bot.editMessageText(`⬆️ Subiendo ${audioFiles.length} canciones...`, optionsEdits)
        
        for (let i = 0; i < audioFiles.length; i++) {
          const file = audioFiles[i]
          const fileName = path.basename(file, path.extname(file))
          
          await bot.sendAudio(chatId, file, { 
            caption: `🎵 [${i + 1}/${audioFiles.length}] ${fileName}`
          })
          
          // Actualizar progreso cada 3 canciones
          if ((i + 1) % 3 === 0) {
            await bot.editMessageText(
              `⬆️ Subiendo ${i + 1}/${audioFiles.length} canciones...`, 
              optionsEdits
            )
          }
        }
      }

      // Eliminar mensaje de progreso
      await bot.deleteMessage(chatId, sms.message_id)
      
      // Limpiar archivos temporales
      fs.rmSync(outputDir, { recursive: true, force: true })

    } catch (error) {
      console.error('Error en comando Spotify:', error)
      
      await bot.editMessageText(
        '❌ Error al descargar desde Spotify.\n\n' +
        'Posibles causas:\n' +
        '• El enlace no es válido\n' +
        '• La canción no está disponible\n' +
        '• Problemas de conexión',
        optionsEdits
      )
      
      // Limpiar archivos temporales
      if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true })
      }
    }
  }
}
