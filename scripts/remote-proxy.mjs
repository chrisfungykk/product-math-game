#!/usr/bin/env node
/**
 * Standalone Groq Whisper proxy — runs on a remote VPS that can reach
 * api.groq.com. Zero dependencies beyond Node 18+ (uses built-in fetch,
 * FormData, Blob).
 *
 * Usage:
 *   GROQ_API_KEY=gsk_... node remote-proxy.mjs
 *   # or with a .env file in the same directory (auto-loaded)
 *
 * Env vars:
 *   GROQ_API_KEY   — required
 *   GROQ_STT_LANG  — default "yue"
 *   PORT           — default 3099
 *   CORS_ORIGIN    — default "*"
 */

import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// .env loader (minimal, no deps)
// ---------------------------------------------------------------------------
function loadDotenv() {
  const dir = dirname(fileURLToPath(import.meta.url));
  try {
    const raw = readFileSync(resolve(dir, '.env'), 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // no .env — rely on env vars
  }
}
loadDotenv();

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const GROQ_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';
const MODEL = 'whisper-large-v3-turbo';
const CANTONESE_PROMPT = '廣東話乘數表口訣。數字：零一二三四五六七八九十。';

const PORT = Number(process.env.PORT) || 3099;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_STT_LANG = process.env.GROQ_STT_LANG || 'yue';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

if (!GROQ_API_KEY) {
  console.error('FATAL: GROQ_API_KEY is not set');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function corsHeaders() {
  return {
    'access-control-allow-origin': CORS_ORIGIN,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type, x-audio-name',
    'access-control-max-age': '86400',
  };
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json',
    ...corsHeaders(),
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// Groq transcribe
// ---------------------------------------------------------------------------
async function transcribe(audioBuffer, contentType, filename) {
  const form = new FormData();
  const blob = new Blob([audioBuffer], { type: contentType || 'audio/webm' });
  form.append('file', blob, filename || 'audio.webm');
  form.append('model', MODEL);
  form.append('response_format', 'verbose_json');
  form.append('temperature', '0');
  form.append('language', GROQ_STT_LANG);
  form.append('prompt', CANTONESE_PROMPT);

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Groq ${res.status}: ${detail.slice(0, 500)}`);
  }

  const data = await res.json();
  return { text: data.text ?? '', segments: data.segments };
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  // Health check
  if (url.pathname === '/health') {
    sendJson(res, 200, { ok: true, lang: GROQ_STT_LANG });
    return;
  }

  // Transcribe endpoint
  if (url.pathname === '/api/transcribe') {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method Not Allowed' });
      return;
    }

    try {
      const body = await readBody(req);
      if (!body.length) {
        sendJson(res, 400, { error: 'Empty audio body' });
        return;
      }

      const contentType = req.headers['content-type'] || 'audio/webm';
      const filename = req.headers['x-audio-name'] || 'audio.webm';

      console.log(`[transcribe] ${body.length} bytes, ${contentType}, ${filename}`);
      const result = await transcribe(body, contentType, filename);
      console.log(`[transcribe] → "${result.text.slice(0, 80)}"`);

      sendJson(res, 200, result);
    } catch (err) {
      console.error('[transcribe] error:', err.message);
      sendJson(res, 502, { error: 'Transcription failed', detail: err.message });
    }
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Groq proxy listening on 0.0.0.0:${PORT}`);
  console.log(`  lang=${GROQ_STT_LANG}  cors=${CORS_ORIGIN}`);
  console.log(`  POST http://0.0.0.0:${PORT}/api/transcribe`);
});
