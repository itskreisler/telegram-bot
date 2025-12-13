#!/bin/bash

# Script para descargar música de Spotify usando spotdl + yt-dlp
# Uso: ./spotify-dl.sh <spotify_url> [output_dir]

# Removido set -e para que no falle por errores de fragmentos de yt-dlp

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directorios
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COOKIES_FILE="$SCRIPT_DIR/a.txt"
OUTPUT_DIR="${2:-$SCRIPT_DIR/temp}"

# Validar argumentos
if [ -z "$1" ]; then
    echo -e "${RED}Error: Debes proporcionar un link de Spotify${NC}"
    echo "Uso: $0 <spotify_url> [output_dir]"
    exit 1
fi

SPOTIFY_URL="$1"

# Validar que sea un link de Spotify válido
if [[ ! "$SPOTIFY_URL" =~ ^https://open\.spotify\.com/(intl-[a-z]+/)?(track|playlist|album)/ ]]; then
    echo -e "${RED}Error: URL de Spotify inválida${NC}"
    echo "Debe ser: https://open.spotify.com/track/... o playlist/... o album/..."
    exit 1
fi

# Verificar que exista el archivo de cookies
if [ ! -f "$COOKIES_FILE" ]; then
    echo -e "${YELLOW}Advertencia: No se encontró archivo de cookies en $COOKIES_FILE${NC}"
    echo "Se intentará descargar sin cookies (puede fallar)"
fi

# Crear directorio de salida si no existe
mkdir -p "$OUTPUT_DIR"

echo -e "${GREEN}=== Spotify Downloader ===${NC}"
echo "URL: $SPOTIFY_URL"
echo "Salida: $OUTPUT_DIR"
echo "Cookies: $COOKIES_FILE"
echo ""

# Paso 1: Extraer URLs de YouTube Music usando spotdl
echo -e "${YELLOW}[1/3] Buscando canciones en YouTube Music...${NC}"
TEMP_URLS="/tmp/spotify_urls_$$.txt"

spotdl --log-level ERROR "$SPOTIFY_URL" 2>&1 | \
    grep -oP 'https://music\.youtube\.com/watch\?v=[a-zA-Z0-9_-]+' | \
    sort -u > "$TEMP_URLS"

TOTAL_SONGS=$(wc -l < "$TEMP_URLS")

if [ "$TOTAL_SONGS" -eq 0 ]; then
    echo -e "${RED}Error: No se encontraron canciones${NC}"
    rm -f "$TEMP_URLS"
    exit 1
fi

echo -e "${GREEN}✓ Se encontraron $TOTAL_SONGS canción(es)${NC}"
echo ""

# Paso 2: Descargar cada canción con yt-dlp
echo -e "${YELLOW}[2/3] Descargando canciones...${NC}"

CURRENT=0
FAILED=0
SUCCESS=0

while IFS= read -r url; do
    CURRENT=$((CURRENT + 1))
    echo -e "${YELLOW}[$CURRENT/$TOTAL_SONGS] Descargando: $url${NC}"
    
    # Descargar con yt-dlp
    TEMP_OUTPUT="/tmp/ytdlp_output_$$.log"
    if [ -f "$COOKIES_FILE" ]; then
        yt-dlp --cookies "$COOKIES_FILE" \
               -x --audio-format mp3 \
               --audio-quality 320K \
               --add-metadata \
               --embed-thumbnail \
               --no-playlist \
               -o "$OUTPUT_DIR/%(title)s.%(ext)s" \
               "$url" > "$TEMP_OUTPUT" 2>&1 || true
        EXIT_CODE=$?
    else
        yt-dlp -x --audio-format mp3 \
               --audio-quality 320K \
               --add-metadata \
               --embed-thumbnail \
               --no-playlist \
               -o "$OUTPUT_DIR/%(title)s.%(ext)s" \
               "$url" > "$TEMP_OUTPUT" 2>&1 || true
        EXIT_CODE=$?
    fi
    
    tail -3 "$TEMP_OUTPUT"
    
    # Verificar si se descargó el archivo (más confiable que el exit code)
    if grep -q "Destination:\|100%" "$TEMP_OUTPUT" || [ $EXIT_CODE -eq 0 ]; then
        SUCCESS=$((SUCCESS + 1))
        echo -e "${GREEN}✓ Completada${NC}"
    else
        FAILED=$((FAILED + 1))
        echo -e "${RED}✗ Falló${NC}"
    fi
    
    rm -f "$TEMP_OUTPUT"
    echo ""
done < "$TEMP_URLS"

# Limpieza
rm -f "$TEMP_URLS"

# Paso 3: Resumen
echo -e "${YELLOW}[3/3] Resumen de descarga${NC}"
echo -e "${GREEN}Exitosas: $SUCCESS${NC}"
if [ "$FAILED" -gt 0 ]; then
    echo -e "${RED}Fallidas: $FAILED${NC}"
fi
echo ""
echo -e "${GREEN}✓ Archivos guardados en: $OUTPUT_DIR${NC}"
ls -lh "$OUTPUT_DIR"/*.mp3 2>/dev/null | tail -10

exit 0
