import type { SoundEffectType } from '../types/audio'

/**
 * AudioService - handles all game audio without binary assets.
 * - Chants: browser SpeechSynthesis (yue-HK Cantonese TTS)
 * - SFX: Web Audio API oscillator tones
 * - Background music: optional procedural ambient (off by default)
 */
class AudioServiceImpl {
  private audioCtx: AudioContext | null = null
  private masterVolume = 0.8
  private muted = false
  private speaking = false
  private cantoneseVoice: SpeechSynthesisVoice | null = null
  private voicesLoaded = false

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices()
      window.speechSynthesis.onvoiceschanged = () => this.loadVoices()
    }
  }

  private loadVoices() {
    const voices = window.speechSynthesis.getVoices()
    // Prefer Cantonese (yue / zh-HK) voices
    this.cantoneseVoice =
      voices.find((v) => v.lang === 'zh-HK' || v.lang === 'yue-HK') ||
      voices.find((v) => v.lang.startsWith('zh-HK')) ||
      voices.find((v) => v.lang.startsWith('zh')) ||
      null
    this.voicesLoaded = voices.length > 0
  }

  private getContext(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext()
    }
    // iOS Safari suspends AudioContext until user gesture — resume if needed
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {
        /* resume may fail before user gesture; unlock() must be called from tap/click */
      })
    }
    return this.audioCtx
  }

  /**
   * Speak a Cantonese chant using TTS.
   * Returns a promise that resolves when speech finishes.
   * onBoundary callback provides approximate audio level for lip sync.
   */
  speakChant(text: string, onLevel?: (level: number) => void): Promise<void> {
    return new Promise((resolve) => {
      if (this.muted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve()
        return
      }

      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      if (this.cantoneseVoice) {
        utterance.voice = this.cantoneseVoice
      }
      utterance.lang = 'zh-HK'
      utterance.rate = 0.8
      utterance.pitch = 1.2
      utterance.volume = this.masterVolume

      this.speaking = true

      // Simulated lip-sync via interval (boundary events unreliable for zh)
      let levelInterval: number | undefined
      if (onLevel) {
        levelInterval = window.setInterval(() => {
          onLevel(0.3 + Math.random() * 0.7)
        }, 100)
      }

      const cleanup = () => {
        this.speaking = false
        if (levelInterval) clearInterval(levelInterval)
        if (onLevel) onLevel(0)
        resolve()
      }

      utterance.onend = cleanup
      utterance.onerror = cleanup

      window.speechSynthesis.speak(utterance)

      // Fallback timeout (some browsers never fire onend)
      window.setTimeout(cleanup, text.length * 400 + 2000)
    })
  }

  stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    this.speaking = false
  }

  isPlayingChant(): boolean {
    return this.speaking
  }

  /**
   * Play a sound effect using oscillator tones.
   */
  playEffect(effectType: SoundEffectType) {
    if (this.muted) return
    const ctx = this.getContext()
    const now = ctx.currentTime

    switch (effectType) {
      case 'correct':
        // Ascending happy chime: C-E-G
        this.playTone(ctx, 523.25, now, 0.12, 'sine') // C5
        this.playTone(ctx, 659.25, now + 0.1, 0.12, 'sine') // E5
        this.playTone(ctx, 783.99, now + 0.2, 0.2, 'sine') // G5
        break
      case 'incorrect':
        // Low descending buzz
        this.playTone(ctx, 311.13, now, 0.15, 'sawtooth', 0.15) // Eb4
        this.playTone(ctx, 233.08, now + 0.12, 0.2, 'sawtooth', 0.15) // Bb3
        break
      case 'level-complete':
        // Triumphant fanfare: C-E-G-C
        this.playTone(ctx, 523.25, now, 0.15, 'triangle')
        this.playTone(ctx, 659.25, now + 0.12, 0.15, 'triangle')
        this.playTone(ctx, 783.99, now + 0.24, 0.15, 'triangle')
        this.playTone(ctx, 1046.5, now + 0.36, 0.35, 'triangle')
        break
      case 'button-click':
        this.playTone(ctx, 880, now, 0.05, 'sine', 0.1)
        break
    }
  }

  private playTone(
    ctx: AudioContext,
    frequency: number,
    startTime: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.25
  ) {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = type
    oscillator.frequency.value = frequency

    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(volume * this.masterVolume, startTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(startTime)
    oscillator.stop(startTime + duration)
  }

  muteForVoiceInput(isMuted: boolean) {
    this.muted = isMuted
    if (isMuted) this.stopSpeaking()
  }

  setMuted(muted: boolean) {
    this.muted = muted
  }

  getMasterVolume(): number {
    return this.masterVolume * 100
  }

  setMasterVolume(level: number) {
    this.masterVolume = Math.max(0, Math.min(1, level / 100))
  }

  /**
   * Unlock audio on iOS Safari — MUST be called from a user gesture (tap/click).
   * Resumes suspended AudioContext and primes SpeechSynthesis.
   */
  unlock() {
    // Create/resume AudioContext (iOS requires user gesture)
    const ctx = this.getContext()
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    // Prime speech synthesis (iOS requires user gesture for first utterance)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance('')
      u.volume = 0
      u.lang = 'zh-HK'
      window.speechSynthesis.speak(u)
    }
  }

  isVoicesReady(): boolean {
    return this.voicesLoaded
  }
}

// Singleton instance
export const audioService = new AudioServiceImpl()
