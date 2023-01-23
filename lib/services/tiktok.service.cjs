const { fetchUrl } = require('fetch')
const axios = require('axios')
function apiTikWm (
  url,
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
) {
  return new Promise((resolve, reject) => {
    const bodyParsed = new URLSearchParams(op.body).toString()
    fetchUrl(
      `${op.domain}/api/?${bodyParsed}`,
      function (_error, _meta, body) {
        try {
          const data = { ...JSON.parse(body), domain: op.domain }
          resolve(data)
        } catch (error) {
          reject(error)
        }
      }
    )
  })
}
function rapidApiTikWm (url) {
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
module.exports = {
  apiTikWm, rapidApiTikWm
}
