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

## YouTube Video Download

- Command: `expregYouTube.cjs` detects YouTube links
- Auto-downloads audio (MP3) via `youtube-dl-exec`
- Inline keyboard button `🎬 Descargar Video` sends callback `yt_video|<url>`
- Callback `yt_video` shows quality selector (360p/720p/1080p/best)
- Callback `yt_dl|<url>|<quality>` downloads and sends video via buffer
- Temp files in `/tmp/yt_<timestamp>/`, cleaned after send

## TikTok Fallback Flow

- Auto-detects TikTok links via `expregTikTok.cjs`
- Sends video URL directly (`sendVideo`) → falls back to:
  1. Download HD in buffer → `sendVideo` (with redirect following)
  2. Download SD in buffer → `sendVideo`
  3. Send cover photo by URL
  4. Download cover in buffer → `sendPhoto`

## Local Bot API Server

- Optional: set `TELEGRAM_BASE_URL` in `.env` for local server
- Enables 2000MB file uploads instead of 50MB limit
- Run: `telegram-bot-api --api-id=X --api-hash=Y --local`
- Managed via `pm2` as `t_api`

## Important Quirks

- Use `bot.sendMessage(chatId, text)` NOT reply methods for initial messages
- Use `client.editMessageText()` to edit existing messages
- `callback_query` handlers need `client.answerCallbackQuery()` to stop loading spinner
- External APIs may be blocked on server (test with `curl` first)
- TIDAL uses Monochrome instances (public proxies)
- TikTok CDN redirects must be followed when downloading via buffer

## Testing

- No formal test suite exists
- Test manually via Telegram commands
- Test external APIs with `curl` before implementing