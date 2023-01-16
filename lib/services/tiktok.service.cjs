const { fetchUrl } = require('fetch')
module.exports = function (
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
