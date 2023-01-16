const request = require('request')

const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')
const path = require('path')

module.exports = {
  active: false,
  ExpReg: /(https?:\/\/[^\s]+.webm)/,
  async cmd (telegram, msg, match) {
    const filename = `${new Date().getTime()}.webm`
    const r = request(match[0]).on('response', function (res) {
      r.pipe(fs.createWriteStream(path.join(__dirname, filename)))
    })

    r.on('end', function () {
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
          console.log('[webm2mp4] File', filename, 'converted - Uploading...')
          telegram.sendVideo(msg.chat.id, filename + '.mp4').then(function () {
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
