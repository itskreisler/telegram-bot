const axios = require('axios')
const fs = require('fs')
const archiver = require('archiver')
const { configEnv: { USERNAME_BOT } } = require('../../helpers/Helpers.cjs')
// Función para descargar un archivo dado una URL
function downloadFile (url, path) {
  return axios({
    url,
    method: 'GET',
    responseType: 'stream'
  }).then((response) =>
    new Promise((resolve, reject) => {
      response.data
        .pipe(fs.createWriteStream(path))
        .on('finish', () => resolve())
        .on('error', (error) => reject(error))
    })
  )
}
module.exports = {
  active: true,
  ExpReg: new RegExp(`^/st(?:ickers)?(?:@${USERNAME_BOT})?$`, 'im'),
  /**
   *
   * @param {import('../../core/Client.cjs')} client
   * @param {import('node-telegram-bot-api').Message} msg
   */
  async cmd (client, msg) {
    const { chat: { id: chatId } } = msg
    // Verifica si el mensaje es una respuesta a otro mensaje
    if (msg.reply_to_message) {
    // Verifica si el mensaje es una respuesta a un sticker
      if (msg.reply_to_message.sticker) {
        // avisar al usuario que se esta procesando la solicitud
        const isLoading = await client.sendMessage(chatId, 'Descargando stickers, espera un momento...')
        const deleteIsLoading = async () =>
          await client.deleteMessage(chatId, isLoading.message_id)
        // obtiene el ID del sticker
        const { set_name: setName } = msg.reply_to_message.sticker
        // Obtiene el paquete de stickers
        console.log('Obteniendo paquete de stickers->', setName)
        const stickerPack = await client.getStickerSet(setName)
        // Obtiene las URLs de los stickers
        console.log('Obteniendo URLs de los stickers->', setName)
        const fileLinks = stickerPack.stickers.map(async ({ file_id: stickerId }) => {
          const fileLink = await client.getFileLink(stickerId)
          return fileLink
        })
        // Espera a que se resuelvan todas las promesas
        console.log('Esperando a que se resuelvan todas las promesas->', setName)
        const stickerLinks = await Promise.all(fileLinks)
        // Mapea el array de URLs y crea un array de promesas de descarga
        console.log('Mapeando el array de URLs y crea un array de promesas de descarga->', setName)
        const downloadPromises = stickerLinks.map((url) =>
          downloadFile(url, `./temp/${setName}_${url.split('/').pop()}`)
        )
        // Utiliza Promise.all para esperar a que todas las promesas se resuelvan
        console.log('Utiliza Promise.all para esperar a que todas las promesas se resuelvan->', setName)
        Promise.all(downloadPromises)
          .then(() => {
            console.log('Todos los archivos se han descargado exitosamente.'.green)
            const zipFilePath = `./temp/${setName}.zip`

            const output = fs.createWriteStream(zipFilePath)
            const archive = archiver('zip', { zlib: { level: 9 } })

            output.on('close', () => {
              console.log(`Archivo ZIP creado correctamente: ${zipFilePath}`)
              // Envía el archivo ZIP al usuario aquí
              client.sendDocument(chatId, zipFilePath).then((doc) => {
                deleteIsLoading()
                client.sendMessage(chatId, `http://t.me/addstickers/${setName}`, { reply_to_message_id: doc.message_id })
                fs.unlinkSync(zipFilePath)
                stickerLinks.forEach((url) => {
                  const filePath = `./temp/${setName}_${url.split('/').pop()}`
                  fs.unlinkSync(filePath)
                })
              })
            })
            archive.on('error', (err) => {
              console.error('Error al crear el archivo ZIP:', err)
            })
            archive.pipe(output)
            // Agregar los archivos descargados al archivo ZIP
            for (let i = 0; i < stickerLinks.length; i++) {
              const filePath = `./temp/${setName}_${stickerLinks[i].split('/').pop()}`
              const fileName = stickerLinks[i].split('/').pop()
              archive.file(filePath, { name: fileName })
            }
            archive.finalize()
          })
          .catch((error) => {
            console.error('Error al descargar los archivos:', error)
          })
        return
        // Puedes realizar acciones adicionales aquí, como responder al mensaje o guardar el ID del sticker en una base de datos.
      }
    }
    client.sendMessage(chatId, 'Este comando solo funciona respondiendo a un sticker.\nEnviame un sticker y luego responde /stickers al sticker.')
  }
}
