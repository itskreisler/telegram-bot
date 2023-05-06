const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

/**
 *
 * @param {String|Array<[String]>} mediaUrl URL de la imagen a subir
 * @returns {Promise<{domain: String, data: Array<{src: String}>}|{error: String}>} Devuelve una promesa que se resuelve a un objeto con el dominio y los datos de los medios cargados
 * @example
 * const { domain, data } = await telegraPhUpload('https://example.com/image.png')
 * console.log(domain, data)
 */
async function telegraPhUpload (mediaUrl) {
  return new Promise((resolve, reject) => {
    try {
      (async () => {
        // console.log('Uploading image to Telegra.ph...')
        const form = new global.FormData()
        let bufferItems

        if (Array.isArray(mediaUrl) && mediaUrl.length >= 1) {
          const responses = await Promise.all(mediaUrl.map(async (item) => {
            console.log({ item })
            return await fetch(item)
          }))
          bufferItems = await Promise.all(responses.map(async (response) => await response.blob()))
          bufferItems.forEach((bufferItem, i) => form.append(`file${i}`, bufferItem))
        } else {
          const response = await fetch(mediaUrl)
          const bufferItem = await response.blob()
          form.append('file', bufferItem)
        }
        const res = await fetch('https://telegra.ph/upload', {
          method: 'POST',
          body: form
        })
        const json = await res.json()
        if (json.error) {
          reject(json.error)
          return
        }
        resolve({
          domain: 'https://telegra.ph',
          data: json
        })
      })()
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = {
  telegraPhUpload
}
