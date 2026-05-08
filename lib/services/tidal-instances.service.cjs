/**
 * @fileoverview TIDAL API service using Monochrome proxy instances + Qobuz fallback
 * @module services/tidal-instances.service
 */

const axios = require('axios')
const fs = require('fs')
const path = require('path')

// Cleanup old temp files on startup (files older than 1 hour)
try {
  const tmpFiles = fs.readdirSync('/tmp').filter(f => /^.+_\d+\.flac$/.test(f))
  for (const f of tmpFiles) {
    const fp = path.join('/tmp', f)
    const stat = fs.statSync(fp)
    if (Date.now() - stat.mtimeMs > 3600000) {
      fs.unlinkSync(fp)
      console.log('[TIDAL] Startup cleanup removed:', fp)
    }
  }
} catch {}

/**
 * Fallback instances when uptime worker fails
 * @constant {string[]}
 */
const FALLBACK_INSTANCES = [
  'https://eu-central.monochrome.tf',
  'https://us-west.monochrome.tf',
  'https://api.monochrome.tf'
]

/**
 * Qobuz API instances for streaming fallback
 * @constant {string[]}
 */
const QOBUZ_INSTANCES = [
  'https://qobuz.kennyy.com.br'
]

/**
 * Instances cache
 * @type {string[]}
 */
let cachedInstances = null

/**
 * Fetches API instances from uptime workers
 * @async
 * @function getInstances
 * @returns {Promise<string[]>} Array of API instance URLs
 */
async function getInstances() {
  if (cachedInstances) return cachedInstances

  const uptimeUrls = [
    'https://tidal-uptime.jiffy-puffs-1j.workers.dev/',
    'https://tidal-uptime.props-76styles.workers.dev/'
  ]

  for (const url of uptimeUrls) {
    try {
      const response = await axios.get(url, { timeout: 5000 })
      const data = response.data
      if (data?.api && Array.isArray(data.api)) {
        cachedInstances = data.api.map(item => item.url || item)
        return cachedInstances
      }
    } catch (err) {
      console.warn(`[TIDAL] Failed to fetch instances from ${url}:`, err.message)
    }
  }

  cachedInstances = FALLBACK_INSTANCES
  return cachedInstances
}

/**
 * Tries to fetch from instances with fallback
 * @async
 * @function fetchFromInstances
 * @param {string} path - API path (e.g., '/search/?s=shakira')
 * @param {Object} [options] - Fetch options
 * @returns {Promise<Object>} JSON response
 * @throws {Error} If all instances fail
 */
async function fetchFromInstances(path, options = {}) {
  const instances = await getInstances()
  const urlOpts = options.urlOpts || {}

  let lastError = null
  for (const baseUrl of instances) {
    const url = baseUrl.endsWith('/')
      ? `${baseUrl}${path.substring(1)}`
      : `${baseUrl}${path}`

    try {
      const response = await axios.get(url, { params: urlOpts, timeout: 10000 })
      if (response.status === 200) {
        return response.data
      }
      lastError = new Error(`HTTP ${response.status}`)
    } catch (err) {
      lastError = err
      console.warn(`[TIDAL] Instance ${baseUrl} failed:`, err.message)
    }
  }

  throw lastError || new Error('All instances failed')
}

/**
 * Searches for tracks using Monochrome instances
 * @async
 * @function searchTracks
 * @param {string} query - Search query
 * @returns {Promise<Object[]>} Array of track objects
 */
async function searchTracks(query) {
  const data = await fetchFromInstances(`/search/?s=${encodeURIComponent(query)}`)

  const root = data?.data || data
  const items = root?.items || []

  return items.map(track => ({
    id: track.id,
    title: track.title,
    artist: track.artist?.name || track.artists?.[0]?.name,
    album: track.album?.title || track.albumTitle,
    albumId: track.album?.id || track.albumId,
    albumCover: track.album?.cover || track.albumCover,
    duration: track.duration,
    url: track.url
  }))
}

/**
 * Search all (tracks, artists, albums, playlists, videos)
 * @async
 * @function searchAll
 * @param {string} query - Search query
 * @returns {Promise<Object>} Object with arrays for each type
 */
async function searchAll(query) {
  const data = await fetchFromInstances(`/search/?q=${encodeURIComponent(query)}`)
  const root = data?.data || data
  return root
}

/**
 * Search artists only
 * @async
 * @function searchArtists
 * @param {string} query - Search query
 * @returns {Promise<Object[]>} Array of artist objects
 */
async function searchArtists(query) {
  const data = await fetchFromInstances(`/search/?a=${encodeURIComponent(query)}`)
  const root = data?.data || data
  const items = root?.items || []
  return items.map(artist => ({
    id: artist.id,
    name: artist.name,
    picture: artist.picture,
    url: artist.url
  }))
}

/**
 * Search albums only
 * @async
 * @function searchAlbums
 * @param {string} query - Search query
 * @returns {Promise<Object[]>} Array of album objects
 */
async function searchAlbums(query) {
  const data = await fetchFromInstances(`/search/?al=${encodeURIComponent(query)}`)
  const root = data?.data || data
  const items = root?.items || []
  return items.map(album => ({
    id: album.id,
    title: album.title,
    artist: album.artist?.name || album.artists?.[0]?.name,
    cover: album.cover,
    releaseDate: album.releaseDate,
    url: album.url
  }))
}

/**
 * Search playlists only
 * @async
 * @function searchPlaylists
 * @param {string} query - Search query
 * @returns {Promise<Object[]>} Array of playlist objects
 */
async function searchPlaylists(query) {
  const data = await fetchFromInstances(`/search/?p=${encodeURIComponent(query)}`)
  const root = data?.data || data
  const items = root?.items || []
  return items.map(playlist => ({
    id: playlist.id,
    title: playlist.title,
    creator: playlist.creator?.name,
    cover: playlist.cover,
    url: playlist.url
  }))
}

/**
 * Search videos only
 * @async
 * @function searchVideos
 * @param {string} query - Search query
 * @returns {Promise<Object[]>} Array of video objects
 */
async function searchVideos(query) {
  const data = await fetchFromInstances(`/search/?v=${encodeURIComponent(query)}`)
  const root = data?.data || data
  const items = root?.items || []
  return items.map(video => ({
    id: video.id,
    title: video.title,
    artist: video.artist?.name || video.artists?.[0]?.name,
    cover: video.image || video.cover,
    duration: video.duration,
    url: video.url
  }))
}

/**
 * Gets track metadata using instance
 * @async
 * @function getTrackMetadata
 * @param {number} id - Track ID
 * @returns {Promise<Object>} Track metadata
 */
async function getTrackMetadata(id) {
  const data = await fetchFromInstances(`/info/?id=${id}`)
  const jsonData = data?.data || data
  const items = Array.isArray(jsonData) ? jsonData : [jsonData]
  const found = items.find(i => i.id == id || (i.item && i.item.id == id))
  const track = found?.item || found
  if (!track) throw new Error('Track not found')
  return track
}

/**
 * Extracts stream URL from custom format manifest (base64 encoded JSON) or DASH manifest
 * @function extractStreamUrl
 * @param {string} manifest - Base64 encoded manifest
 * @param {string} mimeType - Manifest MIME type
 * @returns {string|null} Stream URL
 */
function extractStreamUrl(manifest, mimeType) {
  if (!manifest) return null

  try {
    // Check for custom format (application/vnd.tidal.bts)
    if (mimeType === 'application/vnd.tidal.bts') {
      const decoded = Buffer.from(manifest, 'base64').toString('utf8')
      const parsed = JSON.parse(decoded)
      return parsed.urls?.[0] || parsed.url || null
    }

    // Try base64 decode first
    try {
      const decoded = Buffer.from(manifest, 'base64').toString('utf8')
      // If it's plain JSON, parse it
      if (decoded.startsWith('{')) {
        const parsed = JSON.parse(decoded)
        return parsed.urls?.[0] || parsed.url || null
      }
      // If it's DASH XML, extract URL
      const match = decoded.match(/https?:\/\/[\w\-.~:?#[\]@!$&'()*+,;=%]+/g)
      return match ? match[0] : null
    } catch {
      // Last try: regex search in original string
      const match = manifest.match(/https?:\/\/[\w\-.~:?#[\]@!$&'()*+,;=%]+/g)
      return match ? match[0] : null
    }
  } catch {
    return null
  }
}

/**
 * Qobuz quality map
 */
const QOBUZ_QUALITY_MAP = {
  HI_RES_LOSSLESS: '27',
  LOSSLESS: '6',
  HIGH: '5',
  LOW: '5'
}

/**
 * Searches Qobuz for a track by ISRC
 * @async
 * @function searchQobuzByIsrc
 * @param {string} isrc - ISRC code
 * @returns {Promise<Object|null>} Qobuz track object or null
 */
async function searchQobuzByIsrc(isrc) {
  if (!isrc) return null
  for (const baseUrl of QOBUZ_INSTANCES) {
    try {
      const { data } = await axios.get(`${baseUrl}/api/get-music?q=${encodeURIComponent(isrc)}&offset=0`, { timeout: 10000 })
      const tracks = data?.data?.tracks?.items || []
      const match = tracks.find(t => t.isrc?.toLowerCase() === isrc.toLowerCase()) || tracks[0]
      if (match?.id) return match
    } catch (err) {
      console.warn(`[QOBUZ] Instance ${baseUrl} search failed:`, err.message)
    }
  }
  return null
}

/**
 * Gets stream URL from Qobuz by track ID
 * @async
 * @function getQobuzStreamUrl
 * @param {string|number} qobuzTrackId - Qobuz track ID
 * @param {string} [quality='LOSSLESS'] - Quality
 * @returns {Promise<Object|null>} { url, rgInfo } or null
 */
async function getQobuzStreamUrl(qobuzTrackId, quality = 'LOSSLESS') {
  const qobuzQuality = QOBUZ_QUALITY_MAP[quality] || '6'
  for (const baseUrl of QOBUZ_INSTANCES) {
    try {
      const { data } = await axios.get(`${baseUrl}/api/download-music?track_id=${qobuzTrackId}&quality=${qobuzQuality}`, { timeout: 15000 })
      if (data?.success && data?.data?.url) {
        return { url: data.data.url }
      }
    } catch (err) {
      console.warn(`[QOBUZ] Instance ${baseUrl} download failed:`, err.message)
    }
  }
  return null
}

/**
 * Gets stream URL - tries Hi-Fi API first, falls back to Qobuz
 * @async
 * @function getStreamUrl
 * @param {number} id - Track ID
 * @param {string} [quality='LOSSLESS'] - Quality (LOW, HIGH, LOSSLESS, HI_RES_LOSSLESS)
 * @returns {Promise<string>} Stream URL
 */
async function getStreamUrl(id, quality = 'LOSSLESS') {
  try {
    const data = await fetchFromInstances(`/track/?id=${id}&quality=${quality}`)
    const info = data?.data || data
    if (info) {
      const streamUrl = extractStreamUrl(info.manifest, info.manifestMimeType)
      if (streamUrl) return streamUrl
    }
  } catch (err) {
    console.warn(`[TIDAL] Hi-Fi stream failed for ${id}, trying Qobuz fallback:`, err.message)
  }

  const track = await getTrackMetadata(id)
  const isrc = track?.isrc
  if (!isrc) throw new Error('No ISRC available for Qobuz fallback')

  const qobuzTrack = await searchQobuzByIsrc(isrc)
  if (!qobuzTrack) throw new Error('Track not found on Qobuz')

  const qobuzResult = await getQobuzStreamUrl(qobuzTrack.id, quality)
  if (!qobuzResult) throw new Error('Failed to get stream URL from Qobuz')

  console.log(`[QOBUZ] Stream URL obtained for track ${id}`)
  return qobuzResult.url
}

/**
 * Gets stream info - tries Hi-Fi API first, falls back to Qobuz
 * @async
 * @function getStreamInfo
 * @param {number} id - Track ID
 * @param {string} [quality='LOSSLESS'] - Quality
 * @returns {Promise<Object>} Stream info including URL and quality
 */
async function getStreamInfo(id, quality = 'LOSSLESS') {
  try {
    const data = await fetchFromInstances(`/track/?id=${id}&quality=${quality}`)
    const info = data?.data || data
    if (info) {
      const streamUrl = extractStreamUrl(info.manifest, info.manifestMimeType)
      if (streamUrl) {
        return {
          url: streamUrl,
          quality: info.audioQuality || quality,
          mimeType: info.manifestMimeType || 'audio/flac',
          bitDepth: info.bitDepth,
          sampleRate: info.sampleRate,
          assetPresentation: info.assetPresentation
        }
      }
    }
  } catch (err) {
    console.warn(`[TIDAL] Hi-Fi stream info failed for ${id}, trying Qobuz fallback:`, err.message)
  }

  const track = await getTrackMetadata(id)
  const isrc = track?.isrc
  if (!isrc) throw new Error('No ISRC available for Qobuz fallback')

  const qobuzTrack = await searchQobuzByIsrc(isrc)
  if (!qobuzTrack) throw new Error('Track not found on Qobuz')

  const qobuzResult = await getQobuzStreamUrl(qobuzTrack.id, quality)
  if (!qobuzResult) throw new Error('Failed to get stream URL from Qobuz')

  console.log(`[QOBUZ] Stream info obtained for track ${id}`)
  return {
    url: qobuzResult.url,
    quality,
    mimeType: 'audio/flac',
    bitDepth: 16,
    sampleRate: 44100
  }
}

/**
 * Gets cover URL for a track/album
 * @function getCoverUrl
 * @param {string|number} id - Cover ID
 * @param {string} [size='1280'] - Size (1280, 640, 320, 160, 80)
 * @returns {string} Cover URL
 */
function getCoverUrl(id, size = '1280') {
  if (!id) return ''
  const formattedId = String(id).replace(/-/g, '/')
  return `https://resources.tidal.com/images/${formattedId}/${size}x${size}.jpg`
}

/**
 * Download a track from TIDAL to file or buffer
 * @async
 * @function downloadTrack
 * @param {number} id - Track ID
 * @param {string} [quality='LOSSLESS'] - Quality (LOW, HIGH, LOSSLESS, HI_RES_LOSSLESS)
 * @param {Object} [options] - Download options
 * @param {string} [options.outputPath] - Output file path (if not provided returns buffer)
 * @param {string} [options.filename] - Custom filename (optional)
 * @param {Function} [options.onProgress] - Progress callback (percent)
 * @param {number} [options.cleanupAfter=3600000] - Auto delete afterMilliseconds (default 1 hour)
 * @returns {Promise<Buffer|string>} Audio buffer or file path
 */
async function downloadTrack(id, quality = 'LOSSLESS', options = {}) {
  const { outputPath, filename, onProgress, cleanupAfter = 3600000 } = options
  const streamInfo = await getStreamInfo(id, quality)

  const response = await axios.get(streamInfo.url, {
    responseType: 'arraybuffer',
    timeout: 300000,
    onDownloadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100)
        onProgress(percent)
      }
    }
  })

  const buffer = Buffer.from(response.data)
  let savedPath = null

  if (outputPath) {
    const fs = require('fs')
    savedPath = outputPath || (filename ? `/tmp/${filename}` : `/tmp/${id}.flac`)
    fs.writeFileSync(savedPath, buffer)
    console.log(`[TIDAL] File saved: ${savedPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`)

    setTimeout(() => {
      try {
        if (fs.existsSync(savedPath)) {
          fs.unlinkSync(savedPath)
          console.log('[TIDAL] Cleaned up:', savedPath)
        }
      } catch (e) {
        console.log('[TIDAL] Cleanup error:', e.message)
      }
    }, cleanupAfter)
  }

  return savedPath || buffer
}

/**
 * Get track info and optionally download
 * @async
 * @function getTrack
 * @param {number} id - Track ID
 * @param {string} [quality='LOSSLESS'] - Quality
 * @param {Object} [options] - Options for download
 * @returns {Promise<Object>} Track object with stream info
 */
async function getTrack(id, quality = 'LOSSLESS', options = {}) {
  const metadata = await getTrackMetadata(id)
  const streamInfo = await getStreamInfo(id, quality)

  const result = {
    id: metadata.id,
    title: metadata.title,
    artist: metadata.artist?.name || metadata.artists?.[0]?.name,
    album: metadata.album?.title,
    albumId: metadata.album?.id,
    albumCover: metadata.album?.cover,
    duration: metadata.duration,
    explicit: metadata.explicit,
    url: streamInfo.url,
    quality: streamInfo.quality,
    bitDepth: streamInfo.bitDepth,
    sampleRate: streamInfo.sampleRate,
    mimeType: streamInfo.mimeType
  }

  if (options.download !== false) {
    result.buffer = await downloadTrack(id, quality, options)
  }

  return result
}

/**
 * Search and get first result ready to download
 * @async
 * @function searchAndDownload
 * @param {string} query - Search query
 * @param {string} [quality='LOSSLESS'] - Quality
 * @param {Object} [options] - Download options
 * @returns {Promise<Object>} Track object with buffer
 */
async function searchAndDownload(query, quality = 'LOSSLESS', options = {}) {
  const tracks = await searchTracks(query)
  if (tracks.length === 0) {
    throw new Error('No tracks found')
  }
  return getTrack(tracks[0].id, quality, options)
}

module.exports = {
  getInstances,
  fetchFromInstances,
  searchTracks,
  searchAll,
  searchArtists,
  searchAlbums,
  searchPlaylists,
  searchVideos,
  getTrackMetadata,
  getStreamUrl,
  getStreamInfo,
  getCoverUrl,
  extractStreamUrl,
  downloadTrack,
  getTrack,
  searchAndDownload,
  FALLBACK_INSTANCES
}