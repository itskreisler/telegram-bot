// require('dotenv').config()
const respuestas = [
  'Si',
  'No',
  'Posiblemente',
  'Seguro que no',
  'Obviamente',
  'Es cierto',
  'Definitivamente',
  'Lo mas probable',
  'No tengo una respuesta para eso..',
  'No podria confirmartelo',
  'No cuentes con ello',
  'Es muy dudoso',
  'Creeria que si',
  'Diria que no',
  'Los astros aun no se alinean'
]
/**
 * @typedef {Object} ConfigEnvTypes
 * @property {String} TELEGRAM_TOKEN_DEV - Token de telegram para el bot en desarrollo
 * @property {String} TELEGRAM_TOKEN_PROD - Token de telegram para el bot en producción
 * @property {String} TELEGRAM_PREFIX - Prefijo para los comandos
 * @property {String} USERNAME_BOT - Nombre de usuario del bot
 * @property {String} NODE_ENV - Entorno de ejecución
 * @property {String} AUTHORIZED_USERS - Usuarios autorizados para usar los comandos
 * @property {String} OPENAI_API_KEY - Api key de openai
 * @property {String} MAXSIZEBYTES - Tamaño máximo de los archivos
 * @property {String} RAPID_API_KEY_GLAVIER_TWITTER - Api key de rapidapi para glavier twitter
 */

/**
 * @typedef {Object} HelpersTypes
 * @property {ConfigEnvTypes} configEnv - Object with the environment variables
 * @property {Array} owners - Array with the owners of the bot
 * @property {Array} ownersId - Array with the owners id of the bot
 * @property {Function} validateDomainTikTok - Function to validate if the url is from tiktok
 * @property {Object} ParseMode - Object with the parse modes
 * @property {Function} isNull - Function to validate if the value is null
 * @property {Function} abbreviateNumber - Function to abbreviate a number
 * @property {Function} converterMb - Function to convert bytes to megabytes
 * @property {Function} randomAnswer - Function to get a random answer
 * @property {Function} getRandomInt - Function to get a random number
 * @property {Function} strip_html_tags - Function to remove html tags
 */

/**
 *
 *
 * @type {HelpersTypes}
 */
module.exports = {
  configEnv: { ...process.env },
  owners: process.env.AUTHORIZED_USERS.split(',').map((admins) => {
    const [user, id] = admins.split(':')
    return [user, parseInt(id)]
  }),
  ownersId: process.env.AUTHORIZED_USERS.split(',').map((admins) => {
    const [, id] = admins.split(':')
    return parseInt(id)
  }),
  validateDomainTikTok (url) {
    const [, , domain] = url.split('/')
    const array = ['www.tiktok.com', 'vm.tiktok.com']
    return array.some((e) => e === domain)
  },
  ParseMode: Object.freeze({ Markdown: 'Markdown', MarkdownV2: 'MarkdownV2', HTML: 'HTML' }),
  isNull (_) {
    return (typeof valor === 'object' && _ === null) || Object.is(_, null)
  },
  abbreviateNumber (number) {
    const abbreviations = ['k', 'M', 'B', 'T']
    for (let i = abbreviations.length - 1; i >= 0; i--) {
      const abbreviation = abbreviations[i]
      const abbreviationValue = Math.pow(10, (i + 1) * 3)
      if (number >= abbreviationValue) {
        return `${(number / abbreviationValue).toFixed(1)}${abbreviation}`
      }
    }
    return number.toString()
  },
  converterMb (size) {
    return (size / 1024 / 1024).toFixed(2)
  },
  randomAnswer () {
    return respuestas[Math.floor(Math.random() * respuestas.length)]
  },
  getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min)) + min
  },
  strip_html_tags (str, exp = /<[^>]*>/g) {
    if ((str === null) || (str === '') || typeof str === 'undefined') { return String('') } else { str = str.toString() }
    return str.replace(exp, '')
  }

}
