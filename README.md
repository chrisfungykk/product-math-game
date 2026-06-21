# 背口決 九因歌遊戲 (Cantonese Multiplication Chanting Game)

Interactive WebGL game for learning Cantonese multiplication tables (乘法表) using the traditional 九因歌 chanting method. Character **Amelia** guides players through tables 9 → 8 → 7 → ... → 1, validating answers via Cantonese voice input.

互動 WebGL 遊戲，用傳統九因歌方法學習廣東乘法表。Amelia 陪你由 9 因歌背到 1 因歌，用廣東話語音輸入答案。

## Features 功能

- 🎮 **Interactive 3D scene** — Amelia avatar (React Three Fiber / WebGL) with idle, chant, celebrate, and error animations
- 🎤 **Cantonese voice input** — Web Speech API (`yue-Hant-HK`) with fuzzy matching + manual text fallback
- 🔊 **TTS chanting** — browser SpeechSynthesis recites each line; no audio assets required
- 📈 **Progressive tables** — 9 → 1, scoring, streaks, star rating
- 📱 **iPad-ready PWA** — installable, offline-capable, responsive, touch gestures
- 🇭🇰 **Cantonese UI** throughout

## Tech Stack

- React 18 + TypeScript + Vite
- React Three Fiber + Three.js (WebGL)
- Zustand (state management)
- React Router
- Tailwind CSS
- Web Speech API (recognition + synthesis)
- Web Audio API (sound effects)

## Development 開發

```bash
npm install          # install dependencies
npm run dev          # start dev server → http://localhost:5173
npm run build        # production build → dist/
npm run preview      # preview production build
npm run type-check   # TypeScript check
npm run lint         # ESLint
node scripts/gen-icons.mjs   # regenerate PWA icons
```

## Deployment 部署

### Vercel
```bash
npm i -g vercel
vercel --prod
```
Config in `vercel.json` (SPA rewrites + asset caching headers).

### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```
Config in `netlify.toml`.

Both auto-detect Vite, run `npm run build`, and publish `dist/`.

## How to Play 玩法

1. Pick a multiplication table (start from 9) — 揀選乘數表（由 9 開始）
2. Amelia chants the line (e.g. 九一得九) — Amelia 讀出口訣
3. Tap 🎤 and repeat in Cantonese — 按麥克風跟住讀
4. Correct → Amelia celebrates, advance — 答啱 Amelia 慶祝，進入下一題
5. Complete all 9 tables → see results — 完成所有乘數表睇結果

**Gestures (iPad):** swipe left = skip, swipe right = replay.

## Browser Support

| Browser | Recognition | Notes |
|---------|-------------|-------|
| **Chrome / Edge** (desktop & Android) | ✅ `yue-Hant-HK` | Best results. Live mic waveform. |
| **Safari** (macOS & iOS) | ⚠️ via `zh-HK` | Recognizer rejects `yue-*`, so the app auto-retries with `zh-HK`. Waveform replaced by a pulse animation to avoid mic contention that breaks Safari recognition. |
| Other / unsupported | — | Auto-falls back to manual text input. |

**Cross-browser handling** (`src/utils/browser.ts`):
- `AudioContext` resolved with `webkitAudioContext` fallback (older Safari).
- `SpeechRecognition` resolved with `webkitSpeechRecognition` fallback.
- Cantonese language tags tried in order, with automatic `language-not-supported` retry.

**Recognition accuracy** (`src/utils/cantoneseMatch.ts`): speech is matched on two tone-stripped signals — a **digit skeleton** (robust to ASR returning Arabic digits like `27` for `二十七`) and a **jyutping pronunciation skeleton** (robust to homophone characters like 狗→九, 於→如, 鐘→中). A curated homophone table covers the full 九因歌 vocabulary.

Voice **synthesis** (Amelia's chant) works where a Cantonese/Chinese system voice is installed; Safari's late voice list is polled until ready.

## Project Structure

```
src/
├── components/        # React components
│   ├── scene/         # 3D scene (AmeliaCharacter, Environment)
│   ├── GameCanvas.tsx # R3F canvas
│   ├── GameScreen.tsx # main game loop
│   ├── HomeScreen.tsx
│   ├── ResultsScreen.tsx
│   ├── ChantDisplay.tsx
│   ├── VoiceInput.tsx
│   └── GameOverlay.tsx
├── contexts/          # Zustand store (GameContext)
├── hooks/             # useSpeechRecognition, useResponsive, useSwipe
├── services/          # AudioService (TTS + SFX)
├── utils/             # chantData (81 lines), voiceValidation
└── types/             # TypeScript types
```
