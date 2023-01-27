/* eslint-disable camelcase */

module.exports = {
  active: true,
  ExpReg: /twitter\.com\/\w+\/status\/([0-9]+)/mi,
  async cmd (bot, content, match) {
    const quality = ['Low', 'Medium', 'High', 'Max']
    const {
      chat: { id },
      text
    } = content
    const [, q] = match
  }
}
