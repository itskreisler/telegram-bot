const prettysize = require('prettysize')
const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')
module.exports = async (client, msg) => {
  if (msg.document.mime_type === 'video/webm') {
    // Check the file size
    if (msg.document.file_size > process.env.MAXSIZEBYTES) {
      console.log(process.env.MAXSIZEBYTES)
      console.log(
        '[webm2mp4] ',
        msg.from,
        ' El archivo subido es demasiado grande.'
      )
      client.sendMessage(
        msg.chat.id,
        'Este archivo es demasiado grande para que yo pueda convertirlo. Debe ser menor que' +
          prettysize(process.env.MAXSIZEBYTES) +
          '.'
      )
      return
    }
    // Download it
    client
      .downloadFile(msg.document.file_id, './tmp/')
      .then(function (filename) {
        ffmpeg(filename)
          .output(filename + '.mp4')
          .outputOptions('-strict -2') // Needed since axc is "experimental"
          .on('end', () => {
            // Cleanup
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
                if (e) {
                  console.error(e)
                }
              })
            })
          })
          .on('error', (e) => {
            console.error(e)
            // Cleanup
            fs.unlink(filename, (err) => {
              if (err) {
                console.error(err)
              }
            })
            fs.unlink(filename + '.mp4', (err) => {
              if (err) {
                console.error(err)
              }
            })
          })
          .run()
      })
  }
}
