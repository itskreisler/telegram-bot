require('dotenv').config()
require('colors')
const Bot = require('./core/Client.cjs');
(async () => new Bot())()
