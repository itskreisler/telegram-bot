import { firefox, chromium } from 'playwright'
import { parse } from 'node:querystring'
import fs from 'node:fs'

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

export interface InstaParams {
  reel: string
}

export interface InstaSuperSaveParams {
  link: string
}

export async function instaVideoSave({ reel }: InstaParams): Promise<any> {
  const ERROR_VIDEO = 'link'
  const CHECK_RESPONSE = 'https://backend.instavideosave.com/allinone'
  return new Promise((resolve, reject) => {
    (async () => {
      const browser = await chromium.launch({
        args
      })
      try {
        const page = await browser.newPage()
        await page.goto('https://instavideosave.net/')
        await page.type(
          '[placeholder="Paste Instagram link..."]',
          reel
        )
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

export async function instaSuperSave({ link }: InstaSuperSaveParams): Promise<any> {
  const DOMAIN = 'https://instasupersave.com/es/'
  const CHECK_RESPONSE = 'https://instasupersave.com/api/convert'
  return new Promise((resolve, reject) => {
    (async () => {
      console.log('Iniciando navegador')
      const browser = await chromium.launch({
        args
      })
      try {
        console.log('Nueva pestaña abierta')
        const page = await browser.newPage()
        console.log('Yendo a la pagina')
        await page.goto(DOMAIN)
        console.log('Esperando 5 segundos')
        await page.waitForTimeout(5000)
        console.log('Escribiendo link')
        await page.waitForSelector('[placeholder="@username  or link"]')
        await page.getByRole('textbox').fill(link)
        console.log('Click en buscar')
        const searchResultSelector = 'form [class="search-form__button"]'
        await page.waitForSelector(searchResultSelector)
        await page.click(searchResultSelector)
        console.log('Esperando respuesta')
        page.on('response', async (response) => {
          const url = response.url()
          if (url === CHECK_RESPONSE) {
            console.log('Respuesta recibida')
            if (!response.ok) reject('error')
            const data = await response.json()

            if (Array.isArray(data)) {
              resolve(data)
            } else if (typeof data === 'object') {
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

export async function getBuffer(url: string): Promise<any> {
  const res = await globalThis.fetch(url, { headers: { 'User-Agent': 'okhttp/4.5.0' }, method: 'GET' })
  let emror: Buffer | undefined
  if (fs.existsSync('./lib/public/emror.gif')) {
    emror = fs.readFileSync('./lib/public/emror.gif')
  }
  if (!res.ok) return { type: 'image/gif', result: emror }
  const buff = Buffer.from(await res.arrayBuffer())
  if (buff) return { type: res.headers.get('content-type'), result: buff }
}

export default {
  instaVideoSave,
  instaSuperSave
}
