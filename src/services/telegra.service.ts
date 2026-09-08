import fetch from 'node-fetch'

export async function telegraPhUpload (mediaUrl: string | string[]): Promise<{ domain: string; data: any }> {
  return new Promise((resolve, reject) => {
    try {
      (async () => {
        const form = new (globalThis as any).FormData()
        let bufferItems: any[]

        if (Array.isArray(mediaUrl) && mediaUrl.length >= 1) {
          const responses = await Promise.all(mediaUrl.map(async (item) => {
            console.log({ item })
            return await fetch(item)
          }))
          bufferItems = await Promise.all(responses.map(async (response) => await response.blob()))
          bufferItems.forEach((bufferItem, i) => form.append(`file${i}`, bufferItem))
        } else {
          const response = await fetch(mediaUrl as string)
          const bufferItem = await response.blob()
          form.append('file', bufferItem)
        }
        const res = await fetch('https://telegra.ph/upload', {
          method: 'POST',
          body: form as any
        })
        const json: any = await res.json()
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

export default {
  telegraPhUpload
}
