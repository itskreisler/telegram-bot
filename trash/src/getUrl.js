import http from 'https'
import { tiktokdownload } from 'tiktok-scraper-without-watermark'

export const getUrl = async (url, cb) => {
  const tiktok = tiktokdownload(url)
  const { nowm } = await tiktok
  const req = http.get(nowm)

  req.on('response', async (data) => {
    await cb(data.rawHeaders[11])
  })
}
