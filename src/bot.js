import TelegramBot from 'node-telegram-bot-api'
import { envFile } from './config.js'
import 'colors'
const { TELEGRAM_TOKEN } = envFile
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true })

console.log('(+) running bot'.green)
export { bot }
