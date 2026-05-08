# Telegram Bot - Agent Instructions

## Architecture

- **Entry point**: `lib/index.cjs` (NOT `bot.js` or `src/`)
- **Bot runs via**: `pm2` as process name `t_bot`
- **Commands go in**: `lib/command/cmd/cmd*.cjs`
- **Events go in**: `lib/events/client/*.cjs`

## Commands

### Add a command

1. Create `lib/command/cmd/cmdName.cjs`
2. Export `active: true/false`, `ExpReg`, and `cmd` function
3. Restart bot: `pm2 restart t_bot`

### Command template

```js
const { configEnv } = require('../../helpers/Helpers.cjs')

module.exports = {
  active: true,
  ExpReg: new RegExp(`^/name(?:@${configEnv.USERNAME_BOT})?\\s+(.+)$`, 'im'),
  async cmd(bot, msg, match) {
    // bot.sendMessage(msg.chat.id, text)
  }
}
```

## Common Tasks

### Restart bot
```bash
pm2 restart t_bot
```

### View logs
```bash
pm2 logs t_bot --lines 50
```

### Check status
```bash
pm2 list
```

## Important Quirks

- Use `bot.sendMessage(chatId, text)` NOT reply methods for initial messages
- Use `client.editMessageText()` to edit existing messages
- `callback_query` handlers need `client.answerCallbackQuery()` to stop loading spinner
- External APIs may be blocked on server (test with `curl` first)
- TIDAL uses Monochrome instances (public proxies)

## Testing

- No formal test suite exists
- Test manually via Telegram commands
- Test external APIs with `curl` before implementing