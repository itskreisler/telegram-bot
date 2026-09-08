import { fetchUrl } from 'fetch'
import axios from 'axios'

export function apiTikWm (
  url: string,
  op = {
    domain: 'https://www.tikwm.com',
    body: {
      url,
      count: 12,
      cursor: 0,
      web: 1,
      hd: 1
    }
  }
): Promise<any> {
  return new Promise((resolve, reject) => {
    const bodyParsed = new URLSearchParams(op.body as any).toString()
    fetchUrl(
      `${op.domain}/api/?${bodyParsed}`,
      function (_error: any, _meta: any, body: any) {
        try {
          const data = { ...JSON.parse(body.toString()), domain: op.domain }
          resolve(data)
        } catch (error) {
          reject(error)
        }
      }
    )
  })
}

export default {
  apiTikWm
}
