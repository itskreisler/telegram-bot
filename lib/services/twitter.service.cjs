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
function glavierApiTwitter ({ id }) {
  const axios = require('axios')
  const { configEnv: { RAPID_API_KEY_GLAVIER_TWITTER } } = require('../helpers/Helpers.cjs')
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: 'https://twitter135.p.rapidapi.com/v2/TweetDetail/',
      params: {
        id
      },
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY_GLAVIER_TWITTER,
        'X-RapidAPI-Host': 'twitter135.p.rapidapi.com'
      }
    };

    (async () => {
      try {
        const response = await axios.request(options)
        const { data: { threaded_conversation_with_injections_v2: { instructions: [entries] } } } = response.data
        if (!entries) reject(new Error('No se encontraron datos'))
        const { content: { itemContent: { tweet_results: { result: { legacy: { full_text: fullText, extended_entities: extendedEntities, entities } } } } } } = entries?.entries.find(({ entryId }) => entryId === `tweet-${id}`)
        if (!extendedEntities) resolve({ fullText })
        resolve({ mediaVideo: extendedEntities?.media || [], mediaImgs: entities?.media || [], fullText })
      } catch (error) {
        console.error(error)
        reject(error)
      }
    })()
  })
}
module.exports = { apiTweetPik, apiTweetPikVideo, glavierApiTwitter }
