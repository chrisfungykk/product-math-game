/**
 * Client-side speech-to-text via our serverless Groq proxy.
 *
 * Sends the raw audio blob to /api/transcribe (overridable with
 * VITE_STT_ENDPOINT). The Groq API key lives only on the server — see
 * api/transcribe.ts and api/_transcribe-core.ts.
 */

export interface TranscriptSegment {
  start: number
  end: number
  text: string
}

export interface TranscriptionResult {
  text: string
  segments?: TranscriptSegment[]
}

const ENDPOINT =
  (import.meta.env.VITE_STT_ENDPOINT as string | undefined) ?? '/api/transcribe'

/**
 * Transcribe an audio blob. `filename` should carry an extension matching the
 * blob's container (webm/mp4) so Whisper can detect the format.
 */
export async function transcribeAudio(
  blob: Blob,
  filename = 'audio.webm'
): Promise<TranscriptionResult> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': blob.type || 'audio/webm',
      'x-audio-name': filename,
    },
    body: blob,
  })

  if (!res.ok) {
    let detail = ''
    try {
      const body = await res.json()
      detail = body?.detail || body?.error || ''
    } catch {
      /* non-JSON error */
    }
    throw new Error(`Transcription failed (${res.status})${detail ? `: ${detail}` : ''}`)
  }

  const data = (await res.json()) as TranscriptionResult
  return { text: data.text ?? '', segments: data.segments }
}
