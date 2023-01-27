require('dotenv').config()
require('colors')
const fs = require('fs')
if (!fs.existsSync('./tmp/')) {
  fs.mkdirSync('./tmp/')
}

const Bot = require('./core/Client.cjs');
(async () => new Bot())()
