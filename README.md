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
- `/ping` - Responde con pong (verifica que el bot responde)
- `/tiktok <link>` - Descarga video de TikTok (con o sin marca de agua)
- `/clima <ciudad>` - Obtiene el clima de una ciudad (usa wttr.in)
- `/google <consulta>` - Busca en Google y devuelve resultados
- `/tidal <id>` - Descarga track de TIDAL por ID (FLAC con fallback a Qobuz)
- `/tidal q <busqueda>` - Busca canciones en TIDAL
- `/tidal a <artista>` - Busca artistas
- `/tidal al <album>` - Busca álbumes
- `/tidal p <playlist>` - Busca playlists
- `/tidal v <video>` - Busca videos
- `/cron -e "cron" -url <url> -t json|file [-r returnPath] [-m template]` - Programa tareas periódicas
- `/cron list` - Lista tareas activas
- `/cron delete <nombre>` - Elimina una tarea
- `/demucs` - Separa voces del instrumental (responder a un audio)
- `/stw` - Obtiene imagen diaria de STW Daily
- `/donate` - Información de donaciones
- `/sticker` - Crea stickers
- `/uptime` - Muestra el tiempo activo del bot
- `/ama` - Pregunta a la IA
- `/whatif` - Pregunta "¿Qué pasaría si?" a la IA
- `/restart` - Reinicia el bot (solo owner)

### TIDAL con fallback a Qobuz 🔄

La API de Monochrome (Hi-Fi) está caída upstream (devuelve 403). El bot intenta descargar de TIDAL vía Monochrome primero, y si falla, busca el ISRC del track en Qobuz y descarga el FLAC desde ahí.

### Paginación 🔄

Los resultados de búsqueda de TIDAL se paginan (5 por página). Usa los botones ⬅️ ➡️ para navegar.

Cada resultado tiene un botón de descarga (⬇️ para canciones/videos, 📥 para artistas/álbumes/playlists).

### Cron ⏰

Programa tareas periódicas con expresión cron:

```
/cron -e "30 19 * * *" -url "https://api.example.com/data" -t json -r "data.value" -m "Valor: {%#o.data%}"
```

Flags:
- `-e` Expresión cron (5 campos: min hora dia mes dia_sem, o 6: seg min hora dia mes dia_sem)
- `-url` URL a consultar
- `-t` Tipo: `json` o `file`
- `-r` (opcional) ReturnPath para extraer un campo del JSON
- `-m` (opcional) Template blueimp-tmpl para personalizar el mensaje

Subcomandos:
- `list` - Muestra todas las tareas activas
- `delete <nombre>` - Elimina una tarea por nombre

Intervalo mínimo: cada 5 minutos. Se aceptan 6 campos (con segundos fijos, ej: `30 19 * * * *`).

### Inline Query 🔍

- `@meutilbot q shakira` - Busca todo
- `@meutilbot s rock` - Solo canciones
- `@meutilbot a metallica` - Solo artistas
- `@meutilbot al beyonce` - Solo álbumes
- `@meutilbot p chill` - Solo playlists
- `@meutilbot v live` - Solo vídeos

Selecciona un resultado y se enviará `/tidal {id}` para descargar

### The bot already detects tiktok links and changes the language to English and Spanish (more languages ​​can be added) 😎👍
