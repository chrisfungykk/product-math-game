/**
 * Vercel serverless function: POST /api/transcribe
 *
 * Body = raw audio blob. Forwards to Groq Whisper using the server-side
 * GROQ_API_KEY. The browser never sees the key.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleTranscribeRequest } from './_transcribe-core'

// Disable Vercel's automatic body parsing so we receive the raw audio stream.
export const config = { api: { bodyParser: false } }

export default function handler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse
): Promise<void> {
  return handleTranscribeRequest(req, res, {
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    GROQ_STT_LANG: process.env.GROQ_STT_LANG,
  })
}
