export async function searchTracks(query: string): Promise<any[]> {
  return []
}

export async function searchArtists(query: string): Promise<any[]> {
  return []
}

export async function searchAlbums(query: string): Promise<any[]> {
  return []
}

export async function searchPlaylists(query: string): Promise<any[]> {
  return []
}

export async function searchVideos(query: string): Promise<any[]> {
  return []
}

export async function getStreamInfo(id: string): Promise<any> {
  return {}
}

export function getCoverUrl(id: string, size = '160'): string {
  return `https://resources.tidal.com/images/${id}/${size}x${size}.jpg`
}

export async function downloadTrack(trackId: string, quality = 'LOSSLESS', options: any = {}): Promise<string> {
  return options.outputPath || `/tmp/tidal_${trackId}.flac`
}

export async function getTrackMetadata(trackId: string): Promise<any> {
  return { id: trackId, title: 'Track', artist: { name: 'Artist' } }
}

export default {
  searchTracks,
  searchArtists,
  searchAlbums,
  searchPlaylists,
  searchVideos,
  getStreamInfo,
  getCoverUrl,
  downloadTrack,
  getTrackMetadata
}
