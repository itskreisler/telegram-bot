/**
 * @typedef {Object} TweetMedia
 * @property {string} media_url_https - URL de la imagen/video
 * @property {string} type - Tipo de medio ('photo' | 'video')
 * @property {Object} [video_info] - Información del video (si type === 'video')
 * @property {Array} video_info.variants - Variantes del video
 */

/**
 * @typedef {Object} TweetResult
 * @property {string} fullText - Texto completo del tweet
 * @property {Array<TweetMedia>} [mediaVideo] - Videos del tweet
 * @property {Array<TweetMedia>} [mediaImgs] - Imágenes del tweet
 */

const { fetchUrl } = require('fetch')
const fs = require('fs')
const path = require('path')
const { baseUrl, baseUrlv2, video } = Object.freeze({
  baseUrl: 'https://tweetpik.com/api/tweets/',
  baseUrlv2: 'https://tweetpik.com/api/v2/tweets',
  video: '/video'
})

const CACHE_DIR = path.join(__dirname, '..', '..', 'cache')

/**
 * Asegura que el directorio de cache exista
 */
function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }
}

/**
 * Obtiene la ruta del archivo de cache para un tweet
 * @param {string} id - ID del tweet
 * @returns {string} Ruta del archivo de cache
 */
function getCachePath(id) {
  return path.join(CACHE_DIR, `twitter-${id}.json`)
}

/**
 * Guarda los datos del tweet en cache
 * @param {string} id - ID del tweet
 * @param {TweetResult} data - Datos del tweet
 */
function saveToCache(id, data) {
  ensureCacheDir()
  fs.writeFileSync(getCachePath(id), JSON.stringify(data, null, 2))
}

/**
 * Obtiene los datos del tweet desde cache
 * @param {string} id - ID del tweet
 * @returns {TweetResult|null} Datos del tweet o null si no existe
 */
function getFromCache(id) {
  const cachePath = getCachePath(id)
  if (fs.existsSync(cachePath)) {
    return JSON.parse(fs.readFileSync(cachePath, 'utf8'))
  }
  return null
}

/**
 * Obtiene datos de un tweet usando TweetPik API
 * @param {string} url - URL del tweet
 * @returns {Promise<Array>} Datos del tweet
 */
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

/**
 * Obtiene datos de video de un tweet usando TweetPik API
 * @param {string} q - Query del tweet
 * @returns {Promise<Object>} Datos del video
 */
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

/**
 * Obtiene datos de un tweet usando RapidAPI (twitter135)
 * @param {Object} params - Parámetros
 * @param {string} params.id - ID del tweet
 * @param {boolean} [params.useCache=false] - Usar cache si está disponible
 * @returns {Promise<TweetResult>} Datos del tweet
 */
function glavierApiTwitter ({ id, useCache = false }) {
  const axios = require('axios')
  const { configEnv: { RAPID_API_KEY_GLAVIER_TWITTER } } = require('../helpers/Helpers.cjs')
  
  if (useCache) {
    const cached = getFromCache(id)
    if (cached) {
      console.log(`[Twitter] Using cache for tweet ${id}`)
      return Promise.resolve(cached)
    }
  }
  
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
        const apiData = response.data.data || response.data
        const { threaded_conversation_with_injections_v2: { instructions: [, entries] } } = apiData
        if (!entries) reject(new Error('No se encontraron datos'))
        const entry = entries?.entries?.find(({ entryId }) => entryId === `tweet-${id}`)
        if (!entry) reject(new Error('No se encontró el tweet'))
        const { content: { itemContent: { tweet_results: { result: { tweet: { legacy } } } } } } = entry
        const { full_text: fullText, extended_entities: extendedEntities, entities } = legacy
        const result = !extendedEntities 
          ? { fullText } 
          : { mediaVideo: extendedEntities?.media || [], mediaImgs: entities?.media || [], fullText }
        
        saveToCache(id, result)
        resolve(result)
      } catch (error) {
        console.error(error)
        reject(error)
      }
    })()
  })
}
module.exports = { apiTweetPik, apiTweetPikVideo, glavierApiTwitter }
