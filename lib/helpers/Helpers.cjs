// require('dotenv').config()
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
  ParseMode: { Markdown: 'Markdown', MarkdownV2: 'MarkdownV2', HTML: 'HTML' },
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
  }
}
