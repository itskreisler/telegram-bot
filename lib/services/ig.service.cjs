const { chromium } = require('playwright')
// ━━ TYPE DEFINITIONS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Parametros de la funcion
 *
 * @private
 * @typedef  {object} InstaParams
 * @property {String} reel - url del reel
 */

/**
 *
 * @param {InstaParams} options Opciones
 * @returns {Promise<{video:Array<{video:String, thumbnail:String}>,v:Boolean}> | Promise<String>
 */
async function instaVideoSave ({ reel }) {
  const ERROR_VIDEO = 'link'
  const CHECK_RESPONSE = 'https://backend.instavideosave.com/allinone'
  return new Promise((resolve, reject) => {
    (async () => {
      const browser = await chromium.launch({
        // headless: 'new', // false
        args: [
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
module.exports = {
  instaVideoSave
}
