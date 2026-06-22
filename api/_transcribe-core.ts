/**
 * Shared, runtime-agnostic Groq Whisper transcription proxy.
 *
 * Used by both the Vercel serverless function (`api/transcribe.ts`) and the
 * Vite dev middleware (see `vite.config.ts`) so local `npm run dev` and the
 * deployed function behave identically. The Groq API key is read from the
 * server environment and never reaches the browser.
 *
 * Files prefixed with `_` are ignored by Vercel as function entrypoints, so
 * this module is a plain helper, not a route.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'

const GROQ_URL = 'https://api.groq.com/openai/v1/audio/transcriptions'
const MODEL = 'whisper-large-v3-turbo'

// Generic Cantonese-numerals prompt to bias Whisper toward digits/口訣
// vocabulary. Intentionally NOT the expected answer — biasing toward the
// correct line would inflate accuracy scoring.
const CANTONESE_PROMPT = '廣東話乘數表口訣。數字：零一二三四五六七八九十。'

export interface TranscribeResult {
  text: string
  segments?: Array<{ start: number; end: number; text: string }>
}

interface TranscribeOptions {
  apiKey: string
  contentType?: string
  filename?: string
  language?: string
  prompt?: string
}

/** Forward raw audio bytes to Groq Whisper and return the transcript. */
export async function transcribeWithGroq(
  audio: Uint8Array,
  opts: TranscribeOptions
): Promise<TranscribeResult> {
  const form = new FormData()
  const blob = new Blob([audio], { type: opts.contentType || 'audio/webm' })
  form.append('file', blob, opts.filename || 'audio.webm')
  form.append('model', MODEL)
  form.append('response_format', 'verbose_json')
  form.append('temperature', '0')
  if (opts.language) form.append('language', opts.language)
  form.append('prompt', opts.prompt ?? CANTONESE_PROMPT)

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${opts.apiKey}` },
    body: form,
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Groq ${res.status}: ${detail.slice(0, 500)}`)
  }

  const data = (await res.json()) as TranscribeResult
  return { text: data.text ?? '', segments: data.segments }
}

interface EnvLike {
  GROQ_API_KEY?: string
  GROQ_STT_LANG?: string
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(body))
}

/** Read the request body as bytes, whether pre-buffered or streamed. */
function readRawBody(req: IncomingMessage & { body?: unknown }): Promise<Uint8Array> {
  const pre = req.body
  if (pre instanceof Uint8Array) return Promise.resolve(pre)
  if (typeof pre === 'string') return Promise.resolve(new TextEncoder().encode(pre))
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => resolve(new Uint8Array(Buffer.concat(chunks))))
    req.on('error', reject)
  })
}

/**
 * Node-style request handler shared by Vercel and the Vite dev server.
 * Expects a POST whose body is the raw audio blob; the audio mime type comes
 * from the Content-Type header and the filename from `x-audio-name`.
 */
export async function handleTranscribeRequest(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse,
  env: EnvLike
): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method Not Allowed' })
    return
  }

  const apiKey = env.GROQ_API_KEY
  if (!apiKey) {
    sendJson(res, 500, { error: 'GROQ_API_KEY is not configured on the server' })
    return
  }

  try {
    const audio = await readRawBody(req)
    if (!audio || audio.byteLength === 0) {
      sendJson(res, 400, { error: 'Empty audio body' })
      return
    }

    const contentType =
      (req.headers['content-type'] as string | undefined) || 'audio/webm'
    const filename =
      (req.headers['x-audio-name'] as string | undefined) || 'audio.webm'

    const result = await transcribeWithGroq(audio, {
      apiKey,
      contentType,
      filename,
      language: env.GROQ_STT_LANG || 'yue',
    })

    sendJson(res, 200, result)
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    sendJson(res, 502, { error: 'Transcription failed', detail })
  }
}
