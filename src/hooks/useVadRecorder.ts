import { useCallback, useEffect, useRef, useState } from 'react'
import { getAudioContextClass, pickAudioRecordingMime } from '../utils/browser'

export type VadState = 'idle' | 'listening' | 'speaking'

export interface VadSegment {
  blob: Blob
  startMs: number
  endMs: number
  filename: string
}

export interface UseVadRecorderOptions {
  /** 'single' stops after the first segment; 'continuous' keeps emitting. */
  mode?: 'single' | 'continuous'
  /** Called with a complete, standalone audio file when a speech segment ends. */
  onSegment: (seg: VadSegment) => void
  /** Silence (ms) after speech that closes a segment. Default 800. */
  silenceMs?: number
  /** RMS level that opens a segment. Default 0.06. */
  startThreshold?: number
  /** RMS level (below) that counts as silence. Default 0.035 (hysteresis). */
  endThreshold?: number
  /** Minimum speech (ms) to keep a segment; shorter = discarded blip. Default 250. */
  minSpeechMs?: number
  /** Hard cap (ms) that force-closes a long segment. Default 12000. */
  maxSegmentMs?: number
}

export interface UseVadRecorderResult {
  state: VadState
  level: number
  error: string | null
  isSupported: boolean
  start: () => Promise<void>
  stop: () => void
}

const TICK_MS = 50

/**
 * Voice-activity-detecting recorder. Uses a Web Audio AnalyserNode to detect
 * speech boundaries by RMS energy, and stops/restarts a MediaRecorder per
 * segment so each emitted blob is an independently decodable audio file
 * (required by Groq Whisper — mid-stream webm chunks lack headers).
 */
export function useVadRecorder(options: UseVadRecorderOptions): UseVadRecorderResult {
  const {
    mode = 'single',
    silenceMs = 800,
    startThreshold = 0.06,
    endThreshold = 0.035,
    minSpeechMs = 250,
    maxSegmentMs = 12000,
  } = options

  const [state, setState] = useState<VadState>('idle')
  const [level, setLevel] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Latest onSegment without retriggering effects.
  const onSegmentRef = useRef(options.onSegment)
  onSegmentRef.current = options.onSegment

  const streamRef = useRef<MediaStream | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const tickRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const stateRef = useRef<VadState>('idle')
  const segStartRef = useRef(0)
  const lastVoiceRef = useRef(0)
  const endingRef = useRef(false)
  const discardRef = useRef(false)
  const activeRef = useRef(false)
  const mimeRef = useRef<{ mimeType: string; ext: string } | undefined>(undefined)

  const isSupported =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined' &&
    !!getAudioContextClass()

  const setVadState = (s: VadState) => {
    stateRef.current = s
    setState(s)
  }

  const teardown = useCallback(() => {
    activeRef.current = false
    if (tickRef.current) {
      clearInterval(tickRef.current)
      tickRef.current = undefined
    }
    try {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop()
      }
    } catch {
      /* already stopped */
    }
    recorderRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    ctxRef.current?.close().catch(() => {
      /* already closed */
    })
    ctxRef.current = null
    analyserRef.current = null
    setLevel(0)
  }, [])

  const stop = useCallback(() => {
    teardown()
    setVadState('idle')
  }, [teardown])

  // Build a recorder for one segment. Each segment uses a fresh recorder so the
  // emitted blob is a complete file.
  const startSegmentRecorder = useCallback(() => {
    const stream = streamRef.current
    if (!stream) return
    chunksRef.current = []
    const mime = mimeRef.current
    const recorder = mime?.mimeType
      ? new MediaRecorder(stream, { mimeType: mime.mimeType })
      : new MediaRecorder(stream)
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorder.onstop = () => {
      const blobType = mime?.mimeType || recorder.mimeType || 'audio/webm'
      const blob = new Blob(chunksRef.current, { type: blobType })
      chunksRef.current = []
      const endMs = Date.now()
      const keep = !discardRef.current && blob.size > 0
      endingRef.current = false
      discardRef.current = false

      if (keep) {
        onSegmentRef.current({
          blob,
          startMs: segStartRef.current,
          endMs,
          filename: `audio.${mime?.ext || 'webm'}`,
        })
      }

      if (!activeRef.current) return
      if (mode === 'single' && keep) {
        teardown()
        setVadState('idle')
      } else {
        setVadState('listening')
      }
    }
    recorder.start()
    recorderRef.current = recorder
  }, [mode, teardown])

  const beginSpeech = useCallback(
    (now: number) => {
      segStartRef.current = now
      lastVoiceRef.current = now
      setVadState('speaking')
      startSegmentRecorder()
    },
    [startSegmentRecorder]
  )

  const endSpeech = useCallback((discard: boolean) => {
    endingRef.current = true
    discardRef.current = discard
    try {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop()
      } else {
        endingRef.current = false
      }
    } catch {
      endingRef.current = false
    }
  }, [])

  const start = useCallback(async () => {
    if (!isSupported) {
      setError('unsupported')
      return
    }
    if (activeRef.current) return
    setError(null)
    mimeRef.current = pickAudioRecordingMime()

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError('not-allowed')
      return
    }
    streamRef.current = stream

    const AudioCtx = getAudioContextClass()
    if (!AudioCtx) {
      setError('unsupported')
      stream.getTracks().forEach((t) => t.stop())
      return
    }
    const ctx = new AudioCtx()
    await ctx.resume().catch(() => {
      /* resume may reject if already running */
    })
    ctxRef.current = ctx
    const source = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 512
    source.connect(analyser)
    analyserRef.current = analyser

    const buf = new Uint8Array(analyser.fftSize)
    activeRef.current = true
    endingRef.current = false
    discardRef.current = false
    setVadState('listening')

    tickRef.current = setInterval(() => {
      const a = analyserRef.current
      if (!a || !activeRef.current) return
      a.getByteTimeDomainData(buf)
      let sumSq = 0
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128
        sumSq += v * v
      }
      const rms = Math.sqrt(sumSq / buf.length)
      setLevel((prev) => prev * 0.6 + rms * 0.4)

      if (endingRef.current) return
      const now = Date.now()

      if (stateRef.current === 'listening') {
        if (rms > startThreshold) beginSpeech(now)
      } else if (stateRef.current === 'speaking') {
        if (rms > endThreshold) lastVoiceRef.current = now
        const silenceDur = now - lastVoiceRef.current
        const segDur = now - segStartRef.current
        if (segDur >= maxSegmentMs) {
          endSpeech(false)
        } else if (silenceDur >= silenceMs) {
          // Discard sub-threshold blips that never became real speech.
          endSpeech(segDur < minSpeechMs)
        }
      }
    }, TICK_MS)
  }, [
    beginSpeech,
    endSpeech,
    endThreshold,
    isSupported,
    maxSegmentMs,
    minSpeechMs,
    silenceMs,
    startThreshold,
  ])

  // Cleanup on unmount.
  useEffect(() => {
    return () => teardown()
  }, [teardown])

  return { state, level, error, isSupported, start, stop }
}
