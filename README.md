# Telegram Bot

Bot de Telegram desarrollado en TypeScript. Actualmente descarga contenido de TikTok y YouTube, gestiona stickers y ofrece comandos básicos de administración y consulta.

## Funciones activas

### Descargas automáticas

- **TikTok:** envía un enlace de TikTok y el bot intenta descargar el vídeo sin marca de agua.
- **YouTube:** envía un enlace de YouTube para descargar audio; también permite solicitar vídeo desde los botones disponibles y elegir calidad.
- **Stickers:** responde a un sticker con `/stickers` para descargar el paquete completo y recibirlo comprimido en ZIP.
- **STW Daily:** `/stw` obtiene y envía la imagen diaria.

Las descargas de YouTube utilizan `yt-dlp`. Las descargas de stickers se guardan temporalmente en `temp/` y se eliminan después de enviar el ZIP.

## Comandos activos

- `/start` - Muestra la ayuda básica del bot.
- `/ping` - Comprueba la respuesta del bot.
- `/uptime` - Muestra cuánto tiempo lleva activo el proceso.
- `/stickers` - Descarga un paquete respondiendo a un sticker.
- `/stw` - Envía la imagen diaria de STW.
- `/donate` - Muestra el enlace de donaciones.
- `/restart` - Reinicia el proceso; solo está disponible para el propietario configurado.
- `/reload` - Recarga comandos, eventos y handlers; solo está disponible para administradores.

## Comandos desactivados

Los módulos de clima, cron, demucs, TIDAL y `whatif` permanecen en el código, pero no se cargan porque están desactivados o no tienen `active: true`.

## Requisitos

- Node.js 20.12 o posterior, necesario para `process.loadEnvFile()`.
- `yt-dlp` disponible en el sistema para las descargas de YouTube.
- Python y Demucs solo son necesarios si se vuelve a activar el comando de separación de audio.

## Instalación

```bash
pnpm install
Copy-Item .env.example .env
```

Edita `.env` con el token y los datos del bot antes de iniciarlo.

## Configuración

Variables principales:

```env
TELEGRAM_TOKEN_DEV=""
TELEGRAM_TOKEN_PROD=""
TELEGRAM_PREFIX="/"
USERNAME_BOT="username_bot"
NODE_ENV="development"
AUTHORIZED_USERS="username:123456789"
MAXSIZEBYTES=10485760
```

`AUTHORIZED_USERS` admite varios propietarios separados por comas, por ejemplo `usuario1:123,usuario2:456`.

## Desarrollo y producción

```bash
pnpm dev          # Ejecuta src/index.ts con recarga automática
pnpm build        # Genera dist/ con tsup
pnpm prod:lib     # Ejecuta el bot compilado
pnpm typecheck    # Comprueba los tipos TypeScript
```

El build conserva la estructura de comandos, eventos y handlers porque el bot los descubre e importa dinámicamente desde `dist/`. La carpeta `src/trash/` se excluye del build.
