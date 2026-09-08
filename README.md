# Telegram Bot - UtilBot

Bot multifuncional de Telegram con soporte para descarga de TikTok, YouTube, TIDAL/Qobuz, clima, IA, cron y más.

## Características

### TikTok
- Detecta enlaces automáticamente y descarga videos sin watermark
- Álbumes de fotos con soporte para MediaGroup
- Fallback: descarga por URL → buffer HD → buffer SD → cover
- Sigue redirects de CDN de TikTok

### YouTube
- Detecta enlaces automáticamente y descarga audio (MP3)
- Botón **🎬 Descargar Video** con selector de calidad: 360p, 720p, 1080p, Mejor calidad
- Miniaturas del video

### TIDAL / Qobuz
- Búsqueda y descarga de tracks, álbumes, playlists y videos
- Fallback automático: TIDAL (Monochrome) → Qobuz (por ISRC)
- Calidad FLAC sin pérdida
- Paginación en resultados

### Otros comandos
- `/clima` - Clima por ciudad
- `/google` - Búsqueda en Google
- `/cron` - Tareas programadas con expresión cron
- `/demucs` - Separación de voces e instrumentos
- `/stw` - Imagen diaria STW Daily
- `/whatif` - Preguntas hipotéticas
- `/sticker` - Crear stickers

## Instalación

```bash
npm install
cp .env.example .env
# Editar .env con tu token de bot
```

## Uso

```bash
npm run prod:lib     # Producción
```

### Servidor Local (opcional)

Para límites mayores de subida (2000 MB):

```bash
# Compilar e instalar telegram-bot-api (https://github.com/tdlib/telegram-bot-api)
# Luego configurar en .env:
TELEGRAM_BASE_URL=http://localhost:8081
```

## Comandos

- `/start` - Inicia el bot
- `/help` - Muestra ayuda
- `/ping` - Responde con pong
- `/clima <ciudad>` - Clima
- `/google <consulta>` - Búsqueda Google
- `/tidal <id>` - Descargar track TIDAL
- `/tidal q <busqueda>` - Buscar canciones
- `/tidal a <artista>` - Buscar artistas
- `/tidal al <album>` - Buscar álbumes
- `/tidal p <playlist>` - Buscar playlists
- `/tidal v <video>` - Buscar videos
- `/cron -e "cron" -url <url> -t json|file [-r returnPath] [-m template]` - Programar tarea
- `/cron list` - Listar tareas
- `/cron delete <nombre>` - Eliminar tarea
- `/demucs` - Separar audio
- `/stw` - STW Daily
- `/donate` - Donaciones
- `/sticker` - Crear stickers
- `/uptime` - Tiempo activo
- `/whatif` - ¿Qué pasaría si?
- `/restart` - Reiniciar bot (solo owner)

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
