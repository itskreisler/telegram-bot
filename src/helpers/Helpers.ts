import { loadEnvFile } from 'node:process'
import { z } from 'zod'

try {
  loadEnvFile()
} catch {
  // Ignorar si no existe .env
}

const respuestas: string[] = [
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

const emptyToUndefined = (value: unknown) => value === '' ? undefined : value
const optionalString = z.preprocess(emptyToUndefined, z.string().optional())

export const ConfigEnvSchema = z.object({
  TELEGRAM_TOKEN_DEV: optionalString,
  TELEGRAM_TOKEN_PROD: optionalString,
  TELEGRAM_PREFIX: optionalString,
  USERNAME_BOT: optionalString,
  NODE_ENV: z.preprocess(
    emptyToUndefined,
    z.enum(['development', 'production']).default('development')
  ),
  AUTHORIZED_USERS: optionalString,
  MAXSIZEBYTES: z.preprocess(emptyToUndefined, z.coerce.number().positive().optional()),
  RAPID_API_KEY_GLAVIER_TWITTER: optionalString,
  OWNER_ID: z.preprocess(emptyToUndefined, z.coerce.number().optional())
}).passthrough()

export type ConfigEnvTypes = z.infer<typeof ConfigEnvSchema>
export const configEnv = ConfigEnvSchema.parse(process.env)

const authorizedUsersStr = configEnv.AUTHORIZED_USERS || ''

export const owners: Array<[string, number]> = authorizedUsersStr
  ? authorizedUsersStr.split(',').map((admins) => {
    const [user, id] = admins.split(':')
    return [user, parseInt(id, 10)]
  })
  : []

export const ownersId: number[] = authorizedUsersStr
  ? authorizedUsersStr.split(',').map((admins) => {
    const [, id] = admins.split(':')
    return parseInt(id, 10)
  })
  : []

export function validateDomainTikTok(url: string): boolean {
  if (!url) return false
  const [, , domain] = url.split('/')
  const array = ['www.tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com']
  return array.some((e) => e === domain)
}

export const ParseMode = Object.freeze({
  Markdown: 'Markdown',
  MarkdownV2: 'MarkdownV2',
  HTML: 'HTML'
} as const)

export function isNull(_: any): boolean {
  return (typeof _ === 'object' && _ === null) || Object.is(_, null)
}

export function abbreviateNumber(number: number): string {
  const abbreviations = ['k', 'M', 'B', 'T']
  for (let i = abbreviations.length - 1; i >= 0; i--) {
    const abbreviation = abbreviations[i]
    const abbreviationValue = Math.pow(10, (i + 1) * 3)
    if (number >= abbreviationValue) {
      return `${(number / abbreviationValue).toFixed(1)}${abbreviation}`
    }
  }
  return number.toString()
}

export function converterMb(size: number): string {
  return (size / 1024 / 1024).toFixed(2)
}

export function randomAnswer(): string {
  return respuestas[Math.floor(Math.random() * respuestas.length)]
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min
}

export function strip_html_tags(str: any, exp = /<[^>]*>/g): string {
  if (str === null || str === '' || typeof str === 'undefined') {
    return ''
  } else {
    str = str.toString()
  }
  return str.replace(exp, '')
}

export default {
  configEnv,
  owners,
  ownersId,
  validateDomainTikTok,
  ParseMode,
  isNull,
  abbreviateNumber,
  converterMb,
  randomAnswer,
  getRandomInt,
  strip_html_tags
}
