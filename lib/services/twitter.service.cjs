const { fetchUrl } = require('fetch')
const api = 'https://tweetpik.com/api/tweets/'
function apiTweetPik (q) {
  return new Promise((resolve, reject) => {
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
async function apiTweetPikVideo (q) {
  const video = '/video'
  return new Promise((resolve, reject) => {
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
module.exports = { apiTweetPik, apiTweetPikVideo }
