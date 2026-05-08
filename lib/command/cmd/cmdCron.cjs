const { configEnv } = require('../../helpers/Helpers.cjs')
const { JsCron } = require('@kreisler/js-cron')
const { z } = require('zod')
const tmpl = require('blueimp-tmpl')

const cron = new JsCron({ timezone: 'America/Bogota' })
const tasks = new Map()

function isTooFrequent(field, minVal) {
  if (field === '*') return true
  const m = field.match(/^\*\/(\d+)$/)
  if (m && parseInt(m[1]) < minVal) return true
  return false
}

function validateCron(exp) {
  const parts = exp.trim().split(/\s+/)
  if (parts.length !== 5 && parts.length !== 6) return 'Deben ser 5 campos (min hora dia mes dia_sem) o 6 (seg min hora dia mes dia_sem)'

  if (parts.length === 6) {
    const sec = parts[0]
    if (sec === '*' || /^\*\//.test(sec)) return 'Intervalo mínimo: 5 min. Segundos debe ser un valor fijo (0-59)'
    const secNum = parseInt(sec)
    if (isNaN(secNum) || secNum < 0 || secNum > 59) return 'Segundos debe ser un número entre 0 y 59'
  }

  const minIdx = parts.length === 6 ? 1 : 0
  if (isTooFrequent(parts[minIdx], 5)) {
    return 'Intervalo mínimo permitido: cada 5 minutos'
  }
  return null
}

const CronSchema = z.object({
  expression: z.string().min(1),
  url: z.string().url(),
  type: z.enum(['json', 'file']),
  returnPath: z.string().optional(),
  message: z.string().optional()
}).refine(d => d.type === 'file' || d.returnPath || d.message, {
  message: 'returnPath o message requerido para type=json'
})

function parseArgs(raw) {
  const exp = raw.match(/-e="([^"]+)"/)?.[1]
  const url = raw.match(/-url="([^"]+)"/)?.[1]
  const type = raw.match(/-t=(json|file)/)?.[1]
  const rp = raw.match(/-r="([^"]+)"/)?.[1]
  const msg = raw.match(/-m="([\s\S]*?)"/)?.[1]

  if (exp) {
    const err = validateCron(exp)
    if (err) return { _error: err }
  }

  const result = CronSchema.safeParse({ expression: exp, url, type, returnPath: rp, message: msg })
  return result.success ? result.data : null
}

module.exports = {
  active: true,
  ExpReg: new RegExp(`^/cron(?:@${configEnv.USERNAME_BOT})?(?:\\s+(.+))?$`, 'im'),
  async cmd(bot, msg, match) {
    const chatId = msg.chat.id
    const input = match?.[1]?.trim() || ''

    if (!input || input === 'list') {
      if (tasks.size === 0) {
        bot.sendMessage(chatId, '📋 No hay tareas programadas.')
        return
      }
      let text = '📋 *Tareas programadas:*\n'
      for (const [name, t] of tasks) {
        text += `\n• *${name}*: \`${t.expression}\`\n  ↳ ${t.url}`
      }
      bot.sendMessage(chatId, text, { parse_mode: 'Markdown' })
      return
    }

    if (input.startsWith('delete ')) {
      const name = input.slice(7).trim()
      if (!tasks.has(name)) {
        bot.sendMessage(chatId, `❌ Tarea "${name}" no encontrada.`)
        return
      }
      cron.destroyTask(name)
      tasks.delete(name)
      bot.sendMessage(chatId, `🗑 Tarea *${name}* eliminada.`, { parse_mode: 'Markdown' })
      return
    }

    const parsed = parseArgs(input)
    if (!parsed || parsed._error) {
      bot.sendMessage(chatId,
        (parsed?._error ? `❌ ${parsed._error}\n\n` : '❌ Comando inválido\n\n') +
        'Agregar:\n' +
        '`/cron -e="*/5 * * * *" -url="..." -t=json -r="campo"`\n' +
        '`/cron -e="*/5 * * * *" -url="..." -t=json -m="{%=o.campo%}"`\n' +
        '`/cron -e="*/5 * * * *" -url="..." -t=file`\n' +
        'Listar: `/cron list`\n' +
        'Eliminar: `/cron delete nombre`\n\n' +
        '⏱ Mínimo 5 min de intervalo\n' +
        '💡 Template: `{%#o.campo%}`, loops, if/else',
        { parse_mode: 'Markdown' }
      )
      return
    }

    const name = `cron_${Date.now()}`
    const callback = async () => {
      try {
        const res = await fetch(parsed.url)
        if (parsed.type === 'json') {
          const json = await res.json()
          let text
          if (parsed.message) {
            text = tmpl(parsed.message, json)
          } else {
            text = String(parsed.returnPath.split('.').reduce((a, b) => a?.[b], json))
          }
          bot.sendMessage(chatId, `⏰ *${name}*:\n${text}`, { parse_mode: 'Markdown' })
        } else {
          const buffer = Buffer.from(await res.arrayBuffer())
          bot.sendDocument(chatId, buffer, {}, { filename: 'archivo', contentType: 'application/octet-stream' })
        }
      } catch (err) {
        bot.sendMessage(chatId, `❌ Error en tarea *${name}*: ${err.message}`, { parse_mode: 'Markdown' })
      }
    }

    cron.createTask(name, parsed.expression, callback)
    tasks.set(name, { ...parsed, callback })
    let extra = ''
    if (parsed.returnPath) extra = `\n📦 Campo: \`${parsed.returnPath}\``
    if (parsed.message) extra = `\n📝 Template:\n\`\`\`\n${parsed.message}\n\`\`\``
    bot.sendMessage(chatId,
      `✅ Tarea *${name}* programada\n⏱ \`${parsed.expression}\`\n🔗 ${parsed.url}${extra}`,
      { parse_mode: 'Markdown' }
    )
  }
}
