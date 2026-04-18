/**
 * @fileoverview TIDAL API service for searching and retrieving music data
 * @module services/tidal.service
 */

const axios = require('axios')

/**
 * TIDAL API client ID (public token from Monochrome)
 * @constant {string}
 */
const TIDAL_CLIENT_ID = 'txNoH4kkV41MfH25'

/**
 * TIDAL API client secret (public token from Monochrome)
 * @constant {string}
 */
const TIDAL_CLIENT_SECRET = 'dQjy0MinCEvxi1O4UmxvxWnDjt4cgHBPw8ll6nYBk98='

/**
 * Base URL for TIDAL API v1
 * @constant {string}
 */
const BASE_URL = 'https://api.tidal.com/v1'

/**
 * Cached access token for TIDAL API
 * @type {string|null}
 */
let accessToken = null

/**
 * Obtains an access token from TIDAL OAuth2 endpoint
 * @async
 * @function getAccessToken
 * @returns {Promise<string>} Access token for API calls
 * @throws {Error} If token request fails
 */
async function getAccessToken() {
  if (accessToken) return accessToken

  const params = new URLSearchParams({
    client_id: TIDAL_CLIENT_ID,
    client_secret: TIDAL_CLIENT_SECRET,
    grant_type: 'client_credentials'
  })

  const res = await axios.post('https://auth.tidal.com/v1/oauth2/token', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${TIDAL_CLIENT_ID}:${TIDAL_CLIENT_SECRET}`).toString('base64')
    }
  })

  accessToken = res.data.access_token
  return accessToken
}

/**
 * Searches for tracks on TIDAL
 * @async
 * @function searchTracks
 * @param {string} query - Search query string (artist, song title, etc.)
 * @returns {Promise<TidalTrack[]>} Array of track objects
 * @throws {Error} If search request fails
 *
 * @example
 * const tracks = await searchTracks('shakira')
 * // Returns: [{ id: 26828560, title: 'Whenever, Wherever', artist: 'Shakira', ... }, ...]
 */
async function searchTracks(query) {
  const token = await getAccessToken()
  const url = `${BASE_URL}/search/tracks`
  const params = {
    countryCode: 'US',
    limit: 10,
    query
  }
  const headers = {
    'Authorization': `Bearer ${token}`
  }
  const response = await axios.get(url, { params, headers })
  const data = response.data
  return (data.items || []).map(track => ({
    id: track.id,
    title: track.title,
    artist: track.artist?.name,
    album: track.album?.title,
    duration: track.duration,
    url: track.url
  }))
}

/**
 * @typedef {Object} TidalTrack
 * @property {number} id - TIDAL track ID
 * @property {string} title - Track title
 * @property {string} artist - Artist name
 * @property {string} album - Album title
 * @property {number} duration - Duration in seconds
 * @property {string} url - TIDAL track URL
 */

/**
 * Gets track metadata from TIDAL
 * @async
 * @function getTrackMetadata
 * @param {number} id - TIDAL track ID
 * @returns {Promise<Object>} Track metadata object
 * @throws {Error} If track not found
 */
async function getTrackMetadata(id) {
  const token = await getAccessToken()
  const url = `${BASE_URL}/tracks/${id}`
  const params = { countryCode: 'US' }
  const headers = { Authorization: `Bearer ${token}` }
  const response = await axios.get(url, { params, headers })
  const data = response.data
  return {
    id: data.id,
    title: data.title,
    artist: data.artist?.name,
    artists: data.artists?.map(a => a.name).join(', '),
    album: data.album?.title,
    duration: data.duration,
    explicit: data.explicit,
    audioQuality: data.audioQuality,
    url: data.url
  }
}

/**
 * Gets track playback/stream info from TIDAL
 * @async
 * @function getTrack
 * @param {number} id - TIDAL track ID
 * @param {string} [quality='LOSSLESS'] - Audio quality (e.g., 'LOSSLESS', 'HI_RES_LOSSLESS', 'HIGH', 'NORMAL')
 * @returns {Promise<Object>} Stream info with manifest and URL
 */
async function getTrack(id, quality = 'LOSSLESS') {
  const token = await getAccessToken()
  const url = `${BASE_URL}/tracks/${id}/playbackinfo`
  const params = {
    countryCode: 'US',
    audioquality: quality,
    playbackmode: 'STREAM',
    assetpresentation: 'FULL'
  }
  const headers = { Authorization: `Bearer ${token}` }
  const response = await axios.get(url, { params, headers })
  return response.data
}

/**
 * Extracts stream URL from manifest
 * @function extractStreamUrlFromManifest
 * @param {Object|string} response - TIDAL track response
 * @returns {string|null} Stream URL or null
 */
function extractStreamUrlFromManifest(response) {
  if (!response) return null

  try {
    const originalTrackUrl = response.OriginalTrackUrl || response.originalTrackUrl
    if (originalTrackUrl) return originalTrackUrl

    const manifest = response.manifest || response.Manifest
    if (!manifest) return null

    let decoded
    if (typeof manifest === 'string') {
      try {
        decoded = atob(manifest)
      } catch {
        decoded = manifest
      }
    } else if (typeof manifest === 'object') {
      if (manifest.urls && Array.isArray(manifest.urls)) {
        return manifest.urls[0]
      }
      return null
    } else {
      return null
    }

    if (decoded.includes('<MPD')) {
      return null
    }

    try {
      const parsed = JSON.parse(decoded)
      if (parsed?.urls && Array.isArray(parsed.urls)) {
        return parsed.urls[0]
      }
      if (parsed?.url) {
        return parsed.url
      }
    } catch {
      const match = decoded.match(/https?:\/\/[\w\-.~:?#[\]@!$&'()*+,;=%/]+/)
      return match ? match[0] : null
    }
  } catch {
    return null
  }
  return null
}

/**
 * Gets stream URL for downloading a track
 * @async
 * @function getStreamUrl
 * @param {number} id - TIDAL track ID
 * @param {string} [quality='LOSSLESS'] - Audio quality
 * @returns {Promise<string>} Stream URL for download
 * @throws {Error} If stream URL cannot be resolved
 */
async function getStreamUrl(id, quality = 'LOSSLESS') {
  const lookup = await getTrack(id, quality)
  const streamUrl = extractStreamUrlFromManifest(lookup)

  if (!streamUrl) {
    throw new Error('Could not resolve stream URL')
  }

  return streamUrl
}

/**
 * Downloads a track from TIDAL
 * @async
 * @function downloadTrack
 * @param {number} id - TIDAL track ID
 * @param {string} [quality='LOSSLESS'] - Audio quality
 * @param {string} [outputPath] - Output file path (optional, if not provided returns buffer)
 * @returns {Promise<Buffer>} Audio file buffer or path
 */
async function downloadTrack(id, quality = 'LOSSLESS', outputPath = null) {
  const streamUrl = await getStreamUrl(id, quality)
  const response = await axios.get(streamUrl, {
    responseType: 'arraybuffer',
    headers: { Authorization: await getAccessToken() }
  })
  const buffer = Buffer.from(response.data)

  if (outputPath) {
    const fs = require('fs')
    fs.writeFileSync(outputPath, buffer)
    return outputPath
  }

  return buffer
}

module.exports = { searchTracks, getTrackMetadata, getTrack, getStreamUrl, downloadTrack, TIDAL_CLIENT_ID }