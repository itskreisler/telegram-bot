import { fetchUrl } from 'fetch'
import querystring from 'querystring'
export const tiktokDl = async (url, cb) => {
  const domain = 'https://www.tikwm.com'
  const body = {
    url,
    count: 12,
    cursor: 0,
    web: 1,
    hd: 1
  }
  fetchUrl(
    `${domain}/api/?${querystring.stringify(body)}`,
    function (_error, _meta, body) {
      const info = JSON.parse(body)
      const data = { ...info, domain }
      cb(data)
    }
  )
}
