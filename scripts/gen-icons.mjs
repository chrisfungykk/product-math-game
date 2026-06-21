// Pure-Node PNG icon generator (no deps). Creates maskable app icons.
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const body = Buffer.concat([typeBuf, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

function makePNG(size) {
  // RGBA pixel buffer with gradient bg + circle + bar shapes
  const px = Buffer.alloc(size * size * 4)
  const cx = size / 2
  const cy = size / 2
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      // Diagonal gradient purple -> pink
      const t = (x + y) / (2 * size)
      let r = Math.round(102 + t * (236 - 102)) // 667eea -> ec4899
      let g = Math.round(126 + t * (72 - 126))
      let b = Math.round(234 + t * (153 - 234))
      // Central white circle
      const dist = Math.hypot(x - cx, y - cy)
      if (dist < size * 0.32) {
        r = 255
        g = 255
        b = 255
      }
      // Pink dot in center (represents a "9" hole / character accent)
      if (dist < size * 0.12) {
        r = 236
        g = 72
        b = 153
      }
      px[i] = r
      px[i + 1] = g
      px[i + 2] = b
      px[i + 3] = 255
    }
  }

  // Add filter byte (0) per scanline
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const size of [192, 512]) {
  const png = makePNG(size)
  writeFileSync(join(outDir, `icon-${size}.png`), png)
  console.log(`Wrote icon-${size}.png (${png.length} bytes)`)
}
