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
  })
}
