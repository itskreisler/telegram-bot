import 'dotenv/config'
import 'colors'
import fs from 'node:fs'
import createBot from './core/Client.js'

if (!fs.existsSync('./tmp/')) {
  fs.mkdirSync('./tmp/')
}

createBot()
