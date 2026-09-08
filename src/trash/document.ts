import prettysize from 'prettysize'
import fs from 'node:fs'
import ffmpeg from 'fluent-ffmpeg'

export default async (client: any, msg: any) => {
  if (msg.document.mime_type === 'video/webm') {
    const maxSizeBytes = parseInt(process.env.MAXSIZEBYTES || '0', 10)
    if (msg.document.file_size > maxSizeBytes) {
      console.log(process.env.MAXSIZEBYTES)
      console.log(
        '[webm2mp4] ',
        msg.from,
        ' El archivo subido es demasiado grande.'
      )
      client.sendMessage(
        msg.chat.id,
        'Este archivo es demasiado grande para que yo pueda convertirlo. Debe ser menor que' +
          prettysize(maxSizeBytes) +
          '.'
      )
      return
    }
    client
      .downloadFile(msg.document.file_id, './tmp/')
      .then(function (filename: string) {
        ffmpeg(filename)
          .output(filename + '.mp4')
          .outputOptions('-strict -2')
          .on('end', () => {
            fs.unlink(filename, (e) => {
              if (e) {
                console.error(e)
              }
            })
            console.log(
              '[webm2mp4] File',
              msg.document.file_name,
              'converted - Uploading...'
            )
            client.sendVideo(msg.chat.id, filename + '.mp4').then(function () {
              fs.unlink(filename + '.mp4', (e) => {
                console.log('Success: File .mp4 deleted!')
                if (e) {
                  console.error(e)
                }
              })
            })
          })
          .on('error', (e: any) => {
            console.error(e)
            fs.unlink(filename, (err) => {
              console.log('Error: File deleted!')
              if (err) {
                console.error(err)
              }
            })
            fs.unlink(filename + '.mp4', (err) => {
              console.log('Error: File .mp4 deleted!')
              if (err) {
                console.error(err)
              }
            })
          })
          .run()
      })
  }
}
