import { lang } from './language.js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { bot } from './bot.js'
// import { userDb, userJson } from './db/users.db.js'
export const typeOptions = (callbackQuery, cb) => {
  const [type, op] = callbackQuery.data.split('|')
  switch (type) {
    case 'lang':

      // userDb.update(userJson, (u) => u.id === callbackQuery.from.id, { setLang: op })
      lang.cb(op)
      return { text: lang.msgLang, action: 'answerCallbackQuery' }
    case 'edit':
      return { text: op, action: 'editMessageText' }
    default:
      return { text: '', action: '', type, op }
  }
}
export const isEmptyObj = (_) =>
  Object.keys(_).length === 0 && _.constructor === Object
export const isEmptyArray = (_) => Array.isArray(_) && _.length === 0
const __filename = fileURLToPath(import.meta.url)
const path = dirname(__filename)
export const __dirname = path
export const binary2Text = (str, args = { zero: '😡', one: '🥺' }) => {
  const { zero, one } = args
  return str
    .replaceAll(zero, '0')
    .replaceAll(one, '1')
    .match(/.{1,8}/g)
    .map((i) => i)
    .map((i) => parseInt(i, 2))
    .map((i) => String.fromCharCode(i))
    .join('')
}
export const text2Binary = (str, args = { zero: '😡', one: '🥺' }) => {
  const { zero, one } = args
  return [...str]
    .map((i) => i.charCodeAt().toString(2).padStart(8, '0'))
    .join('')
    .replaceAll('0', zero)
    .replaceAll('1', one)
}
export const uniqueKey = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
export const converterMb = (size) => (size / 1024 / 1024).toFixed(2)
export async function sendMediaGroup (chatId, images) {
  // Divide las imágenes en grupos de 10
  const chunkedImages = images.reduce((acc, cur, i) => {
    if (i % 10 === 0) {
      acc.push([cur])
    } else {
      acc[acc.length - 1].push(cur)
    }
    return acc
  }, [])

  // Envía cada grupo de 10 imágenes
  for (const chunk of chunkedImages) {
    await bot.sendMediaGroup(chatId, chunk)
  }
}
