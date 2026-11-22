#!/usr/bin/env node
/**
 * Remove white backgrounds from Higgsfield PNGs and export WebP to public/home/.
 *
 * Algorithm:
 *  1. Flood-fill from all four edges, marking near-white connected pixels as BG.
 *     "Near-white" = r,g,b all >= threshold AND saturation <= 20.
 *  2. BG pixels become transparent; edge-adjacent near-white pixels get partial alpha.
 *  3. Very light grey BG pixels convert to semi-transparent black (drop shadow).
 *  4. Trim + 12 px padding, resize longest-side, export WebP.
 */

import sharp from 'sharp'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC = join(__dirname, 'home-src')
const OUT = join(__dirname, '..', 'public', 'home')

const FILES = [
  { name: 'nb-pink-glitter', maxSide: 1200, maxKB: 250, threshold: 240 },
  { name: 'nb-zebra',        maxSide: 1200, maxKB: 250, threshold: 240 },
  { name: 'nb-holo',         maxSide: 1200, maxKB: 250, threshold: 240 },
  { name: 'nb-leopard',      maxSide: 1200, maxKB: 250, threshold: 240 },
  { name: 'booth',           maxSide: 1200, maxKB: 250, threshold: 238 },
  { name: 'strip',           maxSide: 1200, maxKB: 250, threshold: 238 },
  { name: 'gem-heart',       maxSide: 512,  maxKB: 60,  threshold: 240 },
  { name: 'gem-lilac',       maxSide: 512,  maxKB: 60,  threshold: 240 },
]

function getSaturation(r, g, b) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max === 0) return 0
  return (max - min) / max
}

function floodFillBG(data, width, height, threshold) {
  // data: Uint8Array of RGBA pixels
  const isBGCandidate = (i) => {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    return r >= threshold && g >= threshold && b >= threshold && getSaturation(r, g, b) <= 0.15
  }

  const marked = new Uint8Array(width * height) // 0=unvisited, 1=BG, 2=FG

  const queue = []
  const addEdge = (x, y) => {
    const idx = (y * width + x) * 4
    if (isBGCandidate(idx)) {
      queue.push(y * width + x)
      marked[y * width + x] = 1
    }
  }

  // Seed from all four edges
  for (let x = 0; x < width; x++) {
    addEdge(x, 0)
    addEdge(x, height - 1)
  }
  for (let y = 1; y < height - 1; y++) {
    addEdge(0, y)
    addEdge(width - 1, y)
  }

  // BFS
  const dirs = [-1, 1, -width, width]
  while (queue.length) {
    const p = queue.pop()
    const x = p % width
    const y = Math.floor(p / width)
    for (const d of dirs) {
      const nx = (d === -1 || d === 1) ? x + d : x
      const ny = (d === -width || d === width) ? y + (d / width) : y
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
      const np = ny * width + nx
      if (marked[np]) continue
      const ni = np * 4
      if (isBGCandidate(ni)) {
        marked[np] = 1
        queue.push(np)
      } else {
        marked[np] = 2
      }
    }
  }

  return marked
}

async function processFile({ name, maxSide, maxKB, threshold }) {
  const inPath = join(SRC, `${name}.png`)
  if (!existsSync(inPath)) {
    console.warn(`  SKIP ${name}.png (not found)`)
    return null
  }

  const img = sharp(inPath)
  const { width, height, channels } = await img.metadata()

  // Get raw RGBA pixels
  const rawBuf = await img.ensureAlpha().raw().toBuffer()
  const data = new Uint8Array(rawBuf)

  const marked = floodFillBG(data, width, height, threshold)

  // Find BG-adjacent FG pixels for feathering
  const adjacentToBG = new Uint8Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x
      if (marked[p] !== 1) continue
      // Check 4-connected FG neighbours
      for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nx = x + dx, ny = y + dy
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
        const np = ny * width + nx
        if (marked[np] === 0 || marked[np] === 2) {
          adjacentToBG[np] = 1
        }
      }
    }
  }

  // Apply transparency
  for (let p = 0; p < width * height; p++) {
    const i = p * 4
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const brightness = (r + g + b) / 3

    if (marked[p] === 1) {
      // Background pixel
      if (brightness < 230) {
        // Soft drop shadow: convert light grey to semi-transparent black
        const alpha = Math.min(90, Math.round((255 - brightness) * 1.4))
        data[i] = 0; data[i+1] = 0; data[i+2] = 0; data[i+3] = alpha
      } else {
        // Near-white background: fully transparent
        data[i+3] = 0
      }
    } else if (adjacentToBG[p] === 1 && brightness >= 225) {
      // Feather: partial alpha on bright edge pixels
      const alpha = Math.round(((255 - brightness) / 30) * 255)
      data[i+3] = Math.min(data[i+3], Math.max(0, alpha))
    }
  }

  // Build output with sharp
  const outRaw = Buffer.from(data)
  let pipeline = sharp(outRaw, { raw: { width, height, channels: 4 } })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 2 })
    .extend({ top: 12, bottom: 12, left: 12, right: 12, background: { r: 0, g: 0, b: 0, alpha: 0 } })

  // Resize longest side
  pipeline = pipeline.resize(maxSide, maxSide, { fit: 'inside', withoutEnlargement: true })

  let quality = 82
  let outPath = join(OUT, `${name}.webp`)
  let buf

  for (let attempt = 0; attempt < 3; attempt++) {
    buf = await pipeline.webp({ quality, alphaQuality: 90 }).toBuffer()
    const kb = buf.length / 1024
    if (kb <= maxKB) break
    quality -= 8
  }

  writeFileSync(outPath, buf)

  // Get final dimensions
  const meta = await sharp(buf).metadata()
  const kb = (buf.length / 1024).toFixed(1)
  console.log(`  ${name}.webp  ${meta.width}×${meta.height}  ${kb}KB`)

  return { name, w: meta.width, h: meta.height }
}

console.log('Processing Higgsfield PNGs...')
const results = {}
for (const file of FILES) {
  const r = await processFile(file)
  if (r) results[r.name] = { w: r.w, h: r.h }
}
console.log('\nDone! Sizes for lib/homeAssets.ts:')
console.log(JSON.stringify(results, null, 2))
