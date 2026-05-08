const { configEnv } = require('../../helpers/Helpers.cjs')
const { JsCron } = require('@kreisler/js-cron')
const { z } = require('zod')
const tmpl = require('blueimp-tmpl')

const cron = new JsCron({ timezone: 'America/Bogota', runOnInit: true })
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
}).transform(d => ({
  ...d,
  ext: d.url.match(/\.(\w{2,4})(?:\?|$)/)?.[1] || ''
}))

const ctypeToExt = z.string().transform(c => {
  const m = [['png','png'],['jpeg','jpg'],['gif','gif'],['webp','webp'],['mp4','mp4'],['pdf','pdf']]
  return m.find(([k]) => c.includes(k))?.[1] ?? 'bin'
})

function parseArgs(raw) {
  const exp = raw.match(/-e(?:=| )"([^"]+)"/)?.[1] || raw.match(/-e "([^"]+)"(?:\s|$)/)?.[1]
  const url = raw.match(/-url(?:=| )"([^"]+)"/)?.[1] || raw.match(/-url "([^"]+)"(?:\s|$)/)?.[1]
  const type = raw.match(/-t=(json|file)/)?.[1] || raw.match(/-t (json|file)(?:\s|$)/)?.[1]
  const rp = raw.match(/-r(?:=| )"([^"]+)"/)?.[1] || raw.match(/-r "([^"]+)"(?:\s|$)/)?.[1]
  const msg = raw.match(/-m(?:=| )"([\s\S]*?)"/)?.[1] || raw.match(/-m "([\s\S]*?)"(?:\s|$)/)?.[1]

  if (!exp) return { _error: '❌ Falta -e (expressão cron)' }
  if (!url) return { _error: '❌ Falta -url' }
  if (!type) return { _error: '❌ Falta -t (json ou file)' }

  const err = validateCron(exp)
  if (err) return { _error: `❌ ${err}` }

  const result = CronSchema.safeParse({ expression: exp, url, type, returnPath: rp, message: msg })
  if (result.success) return result.data

  const labels = { expression: '-e', url: '-url', type: '-t', returnPath: '-r', message: '-m' }
  const details = result.error.issues.map(i => {
    const f = i.path.join('.')
    return f ? `  • ${labels[f] || f}: ${i.message}` : `  • ${i.message}`
  }).join('\n')
  return { _error: `❌ Errores de validación:\n${details}` }
}

module.exports = {
  active: true,
  ExpReg: new RegExp(`^/(?:cron|c_t|c_d)(?:@${configEnv.USERNAME_BOT})?(?:\\s+(.+))?$`, 'im'),
  cron,
  tasks,
  async cmd(bot, msg, match) {
    const chatId = msg.chat.id
    const input = match?.[1]?.trim() || ''
    const fullCmd = match?.[0] || ''
    const isTestCmd = /^\/c_t/i.test(fullCmd)
    const isDelCmd = /^\/c_d/i.test(fullCmd)

    if (isTestCmd) {
      const name = input
      const task = tasks.get(name)
      if (!task) {
        bot.sendMessage(chatId, `❌ Tarea "${name}" no encontrada.`)
        return
      }
      try {
        await task.callback()
        bot.sendMessage(chatId, `✅ Test de *${name}* ejecutado.`, { parse_mode: 'Markdown' })
      } catch (err) {
        bot.sendMessage(chatId, `❌ Error en test *${name}*: ${err.message}`, { parse_mode: 'Markdown' })
      }
      return
    }

    if (isDelCmd) {
      const name = input
      if (!tasks.has(name)) {
        bot.sendMessage(chatId, `❌ Tarea "${name}" no encontrada.`)
        return
      }
      cron.destroyTask(name)
      tasks.delete(name)
      bot.sendMessage(chatId, `🗑 Tarea *${name}* eliminada.`, { parse_mode: 'Markdown' })
      return
    }

    if (!input || input === 'list') {
      if (tasks.size === 0) {
        bot.sendMessage(chatId, '📋 No hay tareas programadas.')
        return
      }
      let text = '📋 *Tareas programadas:*\n'
      const rows = []
      let i = 0
      for (const [name] of tasks) {
        text += `\n${++i}. \`${name}\`\n  ↳ \`/c_t ${name}\` / \`/c_d ${name}\``
        rows.push([
          { text: '▶️ Test', callback_data: `cron_test|${name}|${chatId}` },
          { text: '🗑 Del', callback_data: `cron_del|${name}` }
        ])
      }
      bot.sendMessage(chatId, text, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: rows }
      })
      return
    }

    if (input.startsWith('test ')) {
      const name = input.slice(5).trim()
      const task = tasks.get(name)
      if (!task) {
        bot.sendMessage(chatId, `❌ Tarea "${name}" no encontrada.`)
        return
      }
      try {
        await task.callback()
        bot.sendMessage(chatId, `✅ Test de *${name}* ejecutado.`, { parse_mode: 'Markdown' })
      } catch (err) {
        bot.sendMessage(chatId, `❌ Error en test *${name}*: ${err.message}`, { parse_mode: 'Markdown' })
      }
      return
    }

    if (input.startsWith('del ') || input.startsWith('delete ')) {
      const prefix = input.startsWith('del ') ? 4 : 7
      const name = input.slice(prefix).trim()
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
        (parsed?._error || '❌ Comando inválido') + '\n\n' +
        'Uso:\n' +
        '`/cron -e="*/5 * * * *" -url="..." -t=json -r="campo"`\n' +
        '`/cron -e="*/5 * * * *" -url="..." -t=json -m="{%=o.campo%}"`\n' +
        '`/cron -e="*/5 * * * *" -url="..." -t=file`\n' +
        'Listar: `/cron list`\n' +
        'Probar:  `/c_t nombre`\n' +
        'Eliminar: `/c_d nombre`\n\n' +
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
          const ext = parsed.ext || ctypeToExt.parse(res.headers?.get('content-type') || '')
          bot.sendDocument(chatId, buffer, {}, { filename: `archivo.${ext}`, contentType: 'application/octet-stream' })
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
