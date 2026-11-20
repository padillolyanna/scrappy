// Turn raw transparent PNGs (e.g. from Higgsfield) into optimised library assets.
//
//   node scripts/process-assets.mjs <raw-dir>
//
// For every <id>.png in <raw-dir> this writes:
//   public/assets/scrappy/full/<id>.webp    (≤1024px, used on the canvas/exports)
//   public/assets/scrappy/thumbs/<id>.webp  (256px, used in the shelf)
// and prints the aspect ratio to paste into lib/assetLibrary.ts.
// Transparent padding is trimmed so stickers sit tight in their boxes.

import { readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const raw = process.argv[2]
if (!raw) {
  console.error('usage: node scripts/process-assets.mjs <raw-dir>')
  process.exit(1)
}
const out = path.join(process.cwd(), 'public/assets/scrappy')
await mkdir(path.join(out, 'full'), { recursive: true })
await mkdir(path.join(out, 'thumbs'), { recursive: true })

for (const file of (await readdir(raw)).filter((f) => /\.(png|webp)$/i.test(f))) {
  const id = file.replace(/\.(png|webp)$/i, '')
  const isFrame = id.startsWith('frame-')
  const base = isFrame ? sharp(path.join(raw, file)) : sharp(path.join(raw, file)).trim({ threshold: 1 })
  const buf = await base.png().toBuffer()
  const meta = await sharp(buf).metadata()
  await sharp(buf).resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true }).webp({ quality: 86, alphaQuality: 90 }).toFile(path.join(out, 'full', `${id}.webp`))
  await sharp(buf).resize({ width: 256, height: 256, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80, alphaQuality: 85 }).toFile(path.join(out, 'thumbs', `${id}.webp`))
  console.log(`${id}\taspect ${(meta.width / meta.height).toFixed(3)}`)
}
