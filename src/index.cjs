require('dotenv').config()
require('colors')
const fs = require('fs')
if (!fs.existsSync('./tmp/')) {
  fs.mkdirSync('./tmp/')
}

const createBot = require('./core/Client.cjs')
createBot()
