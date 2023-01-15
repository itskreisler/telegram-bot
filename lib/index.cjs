require('dotenv').config()
const fs = require('fs')
if (!fs.existsSync('./tmp/')) {
  fs.mkdirSync('./tmp/')
}
require('colors')
const Bot = require('./core/Client.cjs');
(async () => new Bot())()
