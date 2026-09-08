export interface TelegraUploadResult {
    domain: string
    data: Array<Record<string, string>>
}

type MediaUrl = string | readonly string[]

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

export async function telegraPhUpload(mediaUrl: MediaUrl): Promise<TelegraUploadResult> {
    const form = new FormData()
    const urls = typeof mediaUrl === 'string' ? [mediaUrl] : mediaUrl
    const files = await Promise.all(urls.map(async (url) => {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`No se pudo descargar ${url}: ${response.status}`)
        return await response.blob()
    }))

    files.forEach((file, index) => form.append(`file${index}`, file))
    const response = await fetch('https://telegra.ph/upload', { method: 'POST', body: form })
    if (!response.ok) throw new Error(`Telegraph devolvio ${response.status}`)

    const json: unknown = await response.json()
    if (!Array.isArray(json)) throw new Error('Respuesta invalida de Telegraph')
    if (json.some((item) => isRecord(item) && typeof item.error === 'string')) {
        throw new Error('Telegraph rechazo la carga')
    }

    return { domain: 'https://telegra.ph', data: json.filter(isRecord) as Array<Record<string, string>> }
}
