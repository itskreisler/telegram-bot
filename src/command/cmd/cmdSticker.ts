import axios from 'axios'
import fs from 'node:fs'
import { ZipArchive } from 'archiver'
import { fromPath } from 'node-telegram-bot-api/node'
import { configEnv } from '../../helpers/Helpers.js'
import 'colors'

function archiver(format: string, options: any) {
  if (format === 'zip') return new ZipArchive(options)
  throw new Error(`Unsupported archiver format ${format}`)
}

function downloadFile(url: string, path: string): Promise<void> {
  return axios({
    url,
    method: 'GET',
    responseType: 'stream'
  }).then((response) =>
    new Promise<void>((resolve, reject) => {
      response.data
        .pipe(fs.createWriteStream(path))
        .on('finish', () => resolve())
        .on('error', (error: any) => reject(error))
    })
  )
}

export default {
  active: true,
  ExpReg: new RegExp(`^/st(?:ickers)?(?:@${configEnv.USERNAME_BOT})?$`, 'im'),
  async cmd(client: any, msg: any) {
    const { chat: { id: chatId } } = msg
    if (msg.reply_to_message) {
      if (msg.reply_to_message.sticker) {
        const isLoading = await client.sendMessage(chatId, 'Descargando stickers, espera un momento...')
        const deleteIsLoading = async () =>
          await client.deleteMessage(chatId, isLoading.message_id)
        const { set_name: setName } = msg.reply_to_message.sticker
        console.log('Obteniendo paquete de stickers->', setName)
        const stickerPack = await client.getStickerSet(setName)
        console.log('Obteniendo URLs de los stickers->', setName)
        const fileLinks = stickerPack.stickers.map(async ({ file_id: stickerId }: any) => {
          const fileLink = await client.getFileLink(stickerId)
          return fileLink
        })
        console.log('Esperando a que se resuelvan todas las promesas->', setName)
        const stickerLinks = await Promise.all(fileLinks)
        if (!fs.existsSync('./temp')) {
          fs.mkdirSync('./temp', { recursive: true })
        }
        console.log('Mapeando el array de URLs y crea un array de promesas de descarga->', setName)
        const downloadPromises = stickerLinks.map((url: string) =>
          downloadFile(url, `./temp/${setName}_${url.split('/').pop()}`)
        )
        console.log('Utiliza Promise.all para esperar a que todas las promesas se resuelvan->', setName)
        Promise.all(downloadPromises)
          .then(() => {
            console.log('Todos los archivos se han descargado exitosamente.'.green)
            const zipFilePath = `./temp/${setName}.zip`

            const output = fs.createWriteStream(zipFilePath)
            const archive = archiver('zip', { zlib: { level: 9 } })

            output.on('close', () => {
              console.log(`Archivo ZIP creado correctamente: ${zipFilePath}`)
              fromPath(zipFilePath).then((document) => client.sendDocument(chatId, document)).then((doc: any) => {
                deleteIsLoading()
                client.sendMessage(chatId, `http://t.me/addstickers/${setName}`, { reply_parameters: { message_id: doc.message_id } })
                fs.unlinkSync(zipFilePath)
                stickerLinks.forEach((url: string) => {
                  const filePath = `./temp/${setName}_${url.split('/').pop()}`
                  if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath)
                  }
                })
              })
            })
            archive.on('error', (err: any) => {
              console.error('Error al crear el archivo ZIP:', err)
            })
            archive.pipe(output)
            for (let i = 0; i < stickerLinks.length; i++) {
              const filePath = `./temp/${setName}_${stickerLinks[i].split('/').pop()}`
              const fileName = stickerLinks[i].split('/').pop()!
              archive.file(filePath, { name: fileName })
            }
            archive.finalize()
          })
          .catch((error: any) => {
            console.error('Error al descargar los archivos:', error)
          })
        return
      }
    }
    client.sendMessage(chatId, 'Este comando solo funciona respondiendo a un sticker.\nEnviame un sticker y luego responde /stickers al sticker.')
  }
}
