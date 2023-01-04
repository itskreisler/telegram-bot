import querystring from 'querystring'
// import { fetchUrl } from 'fetch'
export const fbDl = async (url, cb) => {
  const res = await globalThis.fetch('https://fdownloader.net')
  const getToken = await res.text()
  const data = querystring.stringify({
    k_exp: getToken.split('k_exp="')[1].split('"')[0],
    k_token: getToken.split('k_token="')[1].split('"')[0],
    q: url
  })
  const config = {
    method: 'post',

    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'user-agent':
          'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Mobile Safari/537.36'
    },
    body: data
  }
  const res2 = await globalThis.fetch(
    'https://fdownloader.net/api/ajaxSearch',
    config
  )
  const datos = await res2.json()
  try {
    const HD = datos.data
      .split('" rel="nofollow"')[0]
      .split('<td>No</td>')[1]
      .split('"')[1]
      .replace(/;/g, '&')
    const SD = datos.data
      .split('>360p (SD)</td>')[1]
      .split('<a href="')[1]
      .split('"')[0]
      .replace(/;/g, '&')
    const info = {
      status: datos.status,
      HD,
      SD,
      p: datos.p
    }
    cb(info)
  } catch (error) {
    if (/^Error:/.test(datos.mess)) {
      cb(datos)
    }
  }
}
