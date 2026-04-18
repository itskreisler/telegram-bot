# 🤩👉 TIKTOK DL - telegram bot

## Download videos of tiktok, NO WATERMARK ✅

## How to use? 🤔

- Install the necessary dependencies with `npm install`
- Get your bot token at [@BotFather](https://telegram.me/BotFather).
- Copy your token and paste it into the variable named "TELEGRAM_TOKEN" .env file
- Finally run script `npm run start`

## Termux fix

- INSTALL GLOBAL NPM PACKAGES

```node
npm config set unsafe-perm true
```

- CLEAN CACHE

```node
npm cache clean
```

- BYPASS SYMLINK ISSUES

```node
npm install --no-bin-links
```

## run sh

```sh
# screen -S [name]
screen -S mi_sesion
# screen -X -S [session # you want to kill] kill
screen -X -S mi_sesion kill
# screen -r [session # you want to resume]
screen -r mi_sesion
```

### Commands 😎👍

- `/start` - Inicia el bot
- `/help` - Muestra ayuda
- `/tiktok <link>` - Descarga video de TikTok (con o sin marca de agua)
- `/clima <ciudad>` - Obtiene el clima de una ciudad (usa wttr.in)
- `/tidal <id>` - Descarga track de TIDAL por ID (FLAC)
- `/tidal q <busqueda>` - Busca canciones en TIDAL
- `/tidal a <artista>` - Busca artistas
- `/tidal al <album>` - Busca álbumes
- `/demucs` - Separa voces del instrumental (responder a un audio)
- `/stw` - Obtiene imagen diaria de STW Daily
- `/restart` - Reinicia el bot (solo owner)

### Paginación 🔄

Los resultados de búsqueda de TIDAL se paginan (5 por página). Usa los botones ⬅️ ➡️ para navegar.

Cada resultado tiene un botón de descarga (⬇️ para canciones/videos, 📥 para artistas/álbumes/playlists).

### Inline Query 🔍

- `@meutilbot q shakira` - Busca todo
- `@meutilbot s rock` - Solo canciones
- `@meutilbot a metallica` - Solo artistas
- `@meutilbot al beyonce` - Solo álbumes
- `@meutilbot p chill` - Solo playlists
- `@meutilbot v live` - Solo vídeos

Selecciona un resultado y se enviará `/tidal {id}` para descargar

### The bot already detects tiktok links and changes the language to English and Spanish (more languages ​​can be added) 😎👍