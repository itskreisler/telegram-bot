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

export function rapidApiTikWm (url: string): Promise<any> {
  const options = {
    method: 'GET',
    url: 'https://tiktok-video-no-watermark2.p.rapidapi.com/',
    params: { url, hd: '0' },
    headers: {
      'X-RapidAPI-Key': 'ff19d52401msh9761bb880b8ce98p15b121jsn4075fc7705d3',
      'X-RapidAPI-Host': 'tiktok-video-no-watermark2.p.rapidapi.com'
    }
  }
  return new Promise((resolve, reject) => {
    axios.request(options).then(function (response) {
      resolve(response.data)
    }).catch(function (error) {
      reject(error)
    })
  })
}

export default {
  apiTikWm,
  rapidApiTikWm
}
