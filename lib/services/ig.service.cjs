const { chromium } = require('playwright')
const { parse } = require('querystring')
/**
 * @type {import('playwright').LaunchOptions.args}
 */
const args = [
  '--autoplay-policy=user-gesture-required',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-domain-reliability',
  '--disable-extensions',
  '--disable-features=AudioServiceOutOfProcess',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-notifications',
  '--disable-offer-store-unmasked-wallet-cards',
  '--disable-popup-blocking',
  '--disable-print-preview',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-setuid-sandbox',
  '--disable-speech-api',
  '--disable-sync',
  '--hide-scrollbars',
  '--ignore-gpu-blacklist',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-pings',
  '--no-sandbox',
  '--no-zygote',
  '--password-store=basic',
  '--use-gl=swiftshader',
  '--use-mock-keychain'
]
// ━━ TYPE DEFINITIONS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Parametros de la funcion
 *
 * @private
 * @typedef  {object} InstaParams
 * @property {String} reel - url del reel
 */

/**
 * Parametros de la funcion
 *
 * @private
 * @typedef  {object} InstaSuperSaveParams
 * @property {String} link - url de instagram publico
 */

/**
 *
 * @param {InstaParams} options Opciones
 * @returns {Promise<{video:Array<{video:String, thumbnail:String}>,v:Boolean}> | Promise<String>
 */
async function instaVideoSave({ reel }) {
  const ERROR_VIDEO = 'link'
  const CHECK_RESPONSE = 'https://backend.instavideosave.com/allinone'
  return new Promise((resolve, reject) => {
    (async () => {
      const browser = await chromium.launch({
        // headless: 'new', // false
        args
      })
      try {
        const page = await browser.newPage()

        await page.goto('https://instavideosave.net/')

        // Set screen size
        // await page.setViewport({ width: 1080, height: 1024 })

        // Type into search box
        await page.type(
          '[placeholder="Paste Instagram link..."]',
          reel
        )

        // Click search button
        const searchResultSelector = 'form [type="submit"]'
        await page.waitForSelector(searchResultSelector)
        await page.click(searchResultSelector)

        page.on('response', async (response) => {
          const url = response.url()
          const request = response.request()
          if (request.method() !== 'OPTIONS' && url === CHECK_RESPONSE) {
            const data = await response.json()
            if (data === ERROR_VIDEO) {
              reject(data)
            }
            resolve(data)
            await browser.close()
          }
        })
      } catch (error) {
        reject(error)
        await browser.close()
      }
    })()
  })
}
/**
 *
 * @param {InstaSuperSaveParams} options Opciones
 * @returns {Promise<{url:Array<{url:String, name:String,type:String,ext:String}>,thumb:String,meta:{title:String, source:String}}> | Promise<String>
 */
async function instaSuperSave({ link }) {
  const DOMAIN = 'https://instasupersave.com/es/'
  const CHECK_RESPONSE = 'https://instasupersave.com/api/convert'
  const GET_VIDEO = 'https://media.instasupersave.com/get'
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const browser = await chromium.launch({
          headless: false, // false
          args
        })
        const page = await browser.newPage()

        await page.goto(DOMAIN)
        /*await page.type(
          '[placeholder="@username  or link"]',
          link
        )*/
        await page.getByRole('textbox').fill(link);
        // Click search button
        const searchResultSelector = 'form [class="search-form__button"]'
        await page.waitForSelector(searchResultSelector)
        await page.click(searchResultSelector)
        page.on('response', async (response) => {
          const url = response.url()
          const request = response.request()
          const method = request.method()
          //console.log({ url, method });
          /*if (url.startsWith(GET_VIDEO) && method === 'GET') {

            require('fs').writeFileSync('insta.webp', await response.body())
            resolve('ok')

          }*/
          if (url === CHECK_RESPONSE) {
            //require('fs').writeFileSync('dos.json', JSON.stringify(data, null, 2), 'utf-8')
            if (!response.ok) reject('error')
            const data = await response.json()

            if (Array.isArray(data)) {
              // Si es un array
              resolve(data)
            } else if (typeof data === 'object') {
              // Si es un objeto
              resolve([data])

            } else {
              resolve(data)
            }

            await browser.close()
          }
        })


      } catch (error) {
        reject(error)
        await browser.close()
      }
    })()
  })
}

async function getBuffer(url) {
  const res = await globalThis.fetch(url, { headers: { 'User-Agent': 'okhttp/4.5.0' }, method: 'GET' })
  const emror = fs.readFileSync('./lib/public/emror.gif')
  if (!res.ok) return { type: 'image/gif', result: emror }
  const buff = await res.buffer()
  if (buff) return { type: res.headers.get('content-type'), result: buff }
}
module.exports = {
  instaVideoSave,
  instaSuperSave
}
