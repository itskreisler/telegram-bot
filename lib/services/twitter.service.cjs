const { fetchUrl } = require('fetch')
const { baseUrl, baseUrlv2, video } = Object.freeze({
  baseUrl: 'https://tweetpik.com/api/tweets/',
  baseUrlv2: 'https://tweetpik.com/api/v2/tweets',
  video: '/video'
})

function apiTweetPik (url) {
  const query = new URLSearchParams({ url }).toString()
  return new Promise((resolve, reject) => {
    fetchUrl(
          `${baseUrlv2}?${query}`,
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
async function apiTweetPikVideo (q) {
  return new Promise((resolve, reject) => {
    fetchUrl(
          `${baseUrl}${q}${video}`,
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
module.exports = { apiTweetPik, apiTweetPikVideo }
