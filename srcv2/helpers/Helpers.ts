import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { z } from 'zod'
const envFilePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../.env')

// si no existe el archivo .env, se crea uno con valores por defecto
if (!fs.existsSync(envFilePath)) {
    fs.writeFileSync(envFilePath, 'TELEGRAM_TOKEN_DEV=\n')
}

process.loadEnvFile(envFilePath)

const envSchema = z.object({
    TELEGRAM_TOKEN_PROD: z.string().default(''),
    TELEGRAM_TOKEN_DEV: z.string().default(''),
    BOT_USERNAME: z.string().default('username'),
    BOT_PREFIX: z.string().default('/'),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    AUTHORIZED_USERS: z.string().default('')
})

export type IprocessEnv = z.infer<typeof envSchema>

export const env = envSchema.parse(process.env)
export const {
    TELEGRAM_TOKEN_PROD,
    TELEGRAM_TOKEN_DEV,
    BOT_USERNAME,
    BOT_PREFIX,
    NODE_ENV,
    AUTHORIZED_USERS
} = env

export const configEnv: IprocessEnv = { ...env }
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

export const owners = (process.env.AUTHORIZED_USERS ?? '').split(',').filter(Boolean).map((admin) => {
    const [user, id] = admin.split(':')
    return [user, parseInt(id, 10)] as [string, number]
})

export const ownersId = (process.env.AUTHORIZED_USERS ?? '').split(',').filter(Boolean).map((admin) => {
    const [, id] = admin.split(':')
    return parseInt(id, 10)
})

export function validateDomainTikTok(url: string) {
    const [, , domain] = url.split('/')
    const domains = ['www.tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com']
    return domains.some((entry) => entry === domain)
}

export const ParseMode = Object.freeze({ Markdown: 'Markdown', MarkdownV2: 'MarkdownV2', HTML: 'HTML' })

export function isNull(value: unknown) {
    return value === null
}

export function abbreviateNumber(number: number) {
    const abbreviations = ['k', 'M', 'B', 'T']
    for (let index = abbreviations.length - 1; index >= 0; index--) {
        const abbreviation = abbreviations[index]
        const abbreviationValue = Math.pow(10, (index + 1) * 3)
        if (number >= abbreviationValue) {
            return `${(number / abbreviationValue).toFixed(1)}${abbreviation}`
        }
    }
    return number.toString()
}

export function converterMb(size: number) {
    return (size / 1024 / 1024).toFixed(2)
}

export function randomAnswer() {
    return respuestas[Math.floor(Math.random() * respuestas.length)]
}

export function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min
}

export function strip_html_tags(value: unknown, exp = /<[^>]*>/g) {
    if (value === null || value === '' || typeof value === 'undefined') return ''
    return String(value).replace(exp, '')
}
