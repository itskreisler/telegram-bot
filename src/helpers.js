import { lang } from './language.js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
export const typeOptions = (callbackQuery, cb) => {
  const [type, op] = callbackQuery.data.split('|')
  switch (type) {
    case 'lang':
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
const __dirname = path
export { __dirname }
