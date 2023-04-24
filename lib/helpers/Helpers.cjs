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
 * @typedef {Object} Helpers
 *
 * @property {Object} configEnv - Object with the environment variables
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
