import { fetchUrl } from 'fetch'
export const twDl = async (q, cb) => {
  const api = 'https://tweetpik.com/api/tweets/'
  return new Promise((resolve, reject) => {
    /* const fetch = new FetchStream(`${api}${q}`)
    fetch.on('error', function (e) {
      reject(e)
    })
    fetch.on('data', function (chunk) {
      const info = JSON.parse(chunk)
      const data = { ...info, api }
      resolve(data)
    }) */
    fetchUrl(
        `${api}${q}`,
        function (_error, _meta, body) {
          try {
            const data = JSON.parse(body)
            resolve(data)
          } catch (error) {
            reject(error)
          }
        }
    )
  })
}
export const twDlVideo = async (q, cb) => {
  const api = 'https://tweetpik.com/api/tweets/'
  const video = '/video'
  return new Promise((resolve, reject) => {
    /* const fetch = new FetchStream(`${api}${q}`)
    fetch.on('error', function (e) {
      reject(e)
    })
    fetch.on('data', function (chunk) {
      const info = JSON.parse(chunk)
      const data = { ...info, api }
      resolve(data)
    }) */
    fetchUrl(
        `${api}${q}${video}`,
        function (_error, _meta, body) {
          try {
            const data = JSON.parse(body)
            resolve(data)
          } catch (error) {
            reject(error)
          }
        }
    )
  })
}
