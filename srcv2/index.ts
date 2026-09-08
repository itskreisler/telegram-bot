import 'colors'
import fs from 'node:fs'
import { ClientBot } from './core/main.js'

if (!fs.existsSync('./tmp/')) {
    fs.mkdirSync('./tmp/')
}

const client = new ClientBot()
await client.initialize()
