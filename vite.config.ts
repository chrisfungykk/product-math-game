import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { version } from './package.json'
import { handleTranscribeRequest } from './api/_transcribe-core'

// Dev-only: serve the Groq transcription proxy at /api/transcribe so `npm run
// dev` works without `vercel dev`. Production uses api/transcribe.ts (Vercel).
function groqTranscribeDevProxy(env: Record<string, string>): Plugin {
  return {
    name: 'groq-transcribe-dev-proxy',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/transcribe', (req, res) => {
        void handleTranscribeRequest(req, res, {
          GROQ_API_KEY: env.GROQ_API_KEY,
          GROQ_STT_LANG: env.GROQ_STT_LANG,
        })
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env vars (including non-VITE_ server secrets) for the dev proxy.
  const env = loadEnv(mode, process.cwd(), '')

  return {
  plugins: [react(), groqTranscribeDevProxy(env)],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three', '@react-three/fiber'],
          'router': ['react-router-dom'],
          'ui': ['zustand'],
        }
      }
    }
  }
  }
})
