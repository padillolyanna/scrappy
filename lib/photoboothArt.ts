// Purikura-style art for the SCRAPPY photobooth: textured backgrounds and
// decorative frames, all drawn procedurally on a canvas (no image assets).
// The same `renderStrip` is used for the live preview and the export, so what
// you see is exactly what downloads.

export type LayoutId = 'classic' | 'mini' | 'double' | 'friendship' | 'grid' | 'collage' | 'cover'

export interface Rect { x: number; y: number; w: number; h: number }

type Ctx = CanvasRenderingContext2D
type Rng = () => number

export function rng(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ─── shapes ───────────────────────────────────────────────────────────────

function heartPath(ctx: Ctx, cx: number, cy: number, size: number) {
  const s = size / 2
  ctx.beginPath()
  ctx.moveTo(cx, cy + s * 0.9)
  ctx.bezierCurveTo(cx - s * 1.4, cy - s * 0.1, cx - s * 0.9, cy - s * 1.25, cx, cy - s * 0.45)
  ctx.bezierCurveTo(cx + s * 0.9, cy - s * 1.25, cx + s * 1.4, cy - s * 0.1, cx, cy + s * 0.9)
  ctx.closePath()
}

function starPath(ctx: Ctx, cx: number, cy: number, r: number, points = 5, inner = 0.45, rot = -Math.PI / 2) {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 ? r * inner : r
    const a = rot + (i * Math.PI) / points
    ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad)
  }
  ctx.closePath()
}

function sparkle(ctx: Ctx, cx: number, cy: number, r: number, color = '#fff') {
  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(cx, cy - r)
  ctx.quadraticCurveTo(cx + r * 0.12, cy - r * 0.12, cx + r, cy)
  ctx.quadraticCurveTo(cx + r * 0.12, cy + r * 0.12, cx, cy + r)
  ctx.quadraticCurveTo(cx - r * 0.12, cy + r * 0.12, cx - r, cy)
  ctx.quadraticCurveTo(cx - r * 0.12, cy - r * 0.12, cx, cy - r)
  ctx.fill()
  ctx.restore()
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

function grain(ctx: Ctx, w: number, h: number, s: number, r: Rng, amount = 0.06) {
  const n = Math.round((w * h) / (14 * s * s))
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = r() > 0.5 ? `rgba(255,255,255,${amount * r()})` : `rgba(0,0,0,${amount * r()})`
    ctx.fillRect(r() * w, r() * h, 1.2 * s, 1.2 * s)
  }
}

// ─── backgrounds ──────────────────────────────────────────────────────────

export interface BgDef { id: string; label: string; draw: (ctx: Ctx, w: number, h: number, s: number) => void }

function glitterFill(ctx: Ctx, w: number, h: number, s: number, base: [string, string], palette: string[], seed: number) {
  const r = rng(seed)
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, base[0])
  g.addColorStop(1, base[1])
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  const n = Math.round((w * h) / (5 * s * s))
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = palette[Math.floor(r() * palette.length)]
    ctx.globalAlpha = 0.25 + r() * 0.75
    const d = (0.6 + r() * 1.6) * s
    ctx.fillRect(r() * w, r() * h, d, d)
  }
  ctx.globalAlpha = 1
  const m = Math.round((w * h) / (2600 * s * s))
  for (let i = 0; i < m; i++) sparkle(ctx, r() * w, r() * h, (2 + r() * 5) * s)
}

function starburst(ctx: Ctx, w: number, h: number, s: number, c1: string, c2: string, glow: string, seed: number) {
  const r = rng(seed)
  const cx = w * 0.5
  const cy = h * 0.32
  const R = Math.hypot(w, h)
  const N = 40
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2
    const a1 = ((i + 1) / N) * Math.PI * 2
    ctx.fillStyle = i % 2 ? c1 : c2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R)
    ctx.lineTo(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R)
    ctx.closePath()
    ctx.fill()
  }
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.55)
  g.addColorStop(0, '#ffffff')
  g.addColorStop(0.18, glow)
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 26; i++) sparkle(ctx, r() * w, r() * h, (3 + r() * 9) * s, 'rgba(255,255,255,.9)')
}

export const BACKGROUNDS: BgDef[] = [
  {
    id: 'leopard', label: 'leopard',
    draw(ctx, w, h, s) {
      const r = rng(11)
      const g = ctx.createLinearGradient(0, 0, w, h)
      g.addColorStop(0, '#EDC27A'); g.addColorStop(0.5, '#D9973F'); g.addColorStop(1, '#E9B862')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
      grain(ctx, w, h, s, r, 0.12)
      const n = Math.round((w * h) / (1500 * s * s))
      for (let i = 0; i < n; i++) {
        const cx = r() * w, cy = r() * h, rad = (8 + r() * 10) * s, rot = r() * Math.PI
        ctx.fillStyle = 'rgba(170,96,30,.8)'
        ctx.beginPath(); ctx.ellipse(cx, cy, rad * 0.72, rad * 0.55, rot, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = '#2B1608'; ctx.lineCap = 'round'; ctx.lineWidth = rad * 0.38
        const k = 3 + Math.floor(r() * 3)
        for (let j = 0; j < k; j++) {
          const st = (j * Math.PI * 2) / k + r() * 0.5
          ctx.beginPath(); ctx.ellipse(cx, cy, rad, rad * 0.8, rot, st, st + ((Math.PI * 2) / k) * (0.4 + r() * 0.3)); ctx.stroke()
        }
      }
      for (let i = 0; i < n * 0.6; i++) {
        ctx.fillStyle = '#2B1608'
        ctx.beginPath(); ctx.ellipse(r() * w, r() * h, (1.5 + r() * 3) * s, (1 + r() * 2) * s, r() * 3, 0, Math.PI * 2); ctx.fill()
      }
    },
  },
  {
    id: 'zebra', label: 'zebra',
    draw(ctx, w, h, s) {
      const r = rng(5)
      ctx.fillStyle = '#FAFAFA'
      ctx.fillRect(0, 0, w, h)
      ctx.save()
      ctx.translate(w / 2, h / 2); ctx.rotate(-0.35); ctx.translate(-w, -h)
      ctx.fillStyle = '#111'
      for (let y = 0; y < h * 2; y += (22 + r() * 10) * s) {
        const t = (6 + r() * 9) * s, f = 0.012 / s + r() * 0.01 / s, p1 = r() * 6, p2 = r() * 6, A = (6 + r() * 8) * s
        ctx.beginPath()
        for (let x = 0; x <= w * 2; x += 6 * s) ctx.lineTo(x, y + Math.sin(x * f + p1) * A)
        for (let x = w * 2; x >= 0; x -= 6 * s) ctx.lineTo(x, y + t + Math.sin(x * f + p2) * A * 0.7 + Math.sin(x * f * 2.3) * t * 0.4)
        ctx.closePath(); ctx.fill()
      }
      ctx.restore()
    },
  },
  { id: 'starburst-blue', label: 'star flash', draw: (ctx, w, h, s) => starburst(ctx, w, h, s, '#1D6CF2', '#5BB8FF', '#BDE6FF', 3) },
  { id: 'starburst-pink', label: 'pink flash', draw: (ctx, w, h, s) => starburst(ctx, w, h, s, '#FF3D9A', '#FF8CC8', '#FFD1E8', 4) },
  { id: 'starburst-sun', label: 'sunburst', draw: (ctx, w, h, s) => starburst(ctx, w, h, s, '#FF9F1C', '#FFD23F', '#FFF4C2', 8) },
  { id: 'glitter-pink', label: 'pink glitter', draw: (ctx, w, h, s) => glitterFill(ctx, w, h, s, ['#FF7EC4', '#D9268A'], ['#ffffff', '#FFD1E8', '#FF4FA3', '#B3005E', '#FFE66B'], 7) },
  { id: 'glitter-silver', label: 'silver glitter', draw: (ctx, w, h, s) => glitterFill(ctx, w, h, s, ['#D9DCE3', '#8E94A3'], ['#ffffff', '#F1F3F7', '#6B7080', '#C9F2FF', '#FFD1E8'], 9) },
  { id: 'glitter-night', label: 'night glitter', draw: (ctx, w, h, s) => glitterFill(ctx, w, h, s, ['#2B0A3E', '#0B0420'], ['#C9A2FF', '#FF4FA3', '#ffffff', '#6FE3FF'], 13) },
  {
    id: 'hearts', label: 'love hearts',
    draw(ctx, w, h, s) {
      const r = rng(21)
      ctx.fillStyle = '#FFF7FA'
      ctx.fillRect(0, 0, w, h)
      const n = Math.round((w * h) / (700 * s * s))
      for (let i = 0; i < n; i++) {
        const sz = (5 + r() * 16) * s
        ctx.save(); ctx.translate(r() * w, r() * h); ctx.rotate((r() - 0.5) * 0.9)
        heartPath(ctx, 0, 0, sz)
        ctx.fillStyle = ['#E8173E', '#FF4F7B', '#FF9EB5', '#C80F35'][Math.floor(r() * 4)]
        ctx.globalAlpha = 0.55 + r() * 0.45
        ctx.fill()
        ctx.restore()
      }
      ctx.globalAlpha = 1
    },
  },
  {
    id: 'daisies', label: 'daisy field',
    draw(ctx, w, h, s) {
      const r = rng(31)
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#9FD3FF'); g.addColorStop(1, '#E6F5FF')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      const n = Math.round((w * h) / (2200 * s * s))
      for (let i = 0; i < n; i++) {
        const cx = r() * w, cy = r() * h, R = (10 + r() * 18) * s, petals = 10 + Math.floor(r() * 4), rot = r()
        ctx.save(); ctx.translate(cx, cy)
        ctx.shadowColor = 'rgba(40,80,140,.25)'; ctx.shadowBlur = 4 * s; ctx.shadowOffsetY = 2 * s
        for (let p = 0; p < petals; p++) {
          ctx.rotate((Math.PI * 2) / petals)
          ctx.fillStyle = '#FFFFFF'
          ctx.beginPath(); ctx.ellipse(R * 0.55, 0, R * 0.48, R * 0.17, rot, 0, Math.PI * 2); ctx.fill()
        }
        ctx.shadowColor = 'transparent'
        const cg = ctx.createRadialGradient(-R * 0.08, -R * 0.08, 0, 0, 0, R * 0.28)
        cg.addColorStop(0, '#FFF27A'); cg.addColorStop(1, '#F2A900')
        ctx.fillStyle = cg
        ctx.beginPath(); ctx.arc(0, 0, R * 0.26, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      }
    },
  },
  {
    id: 'sakura', label: 'sakura',
    draw(ctx, w, h, s) {
      const r = rng(41)
      const g = ctx.createLinearGradient(0, 0, w, h)
      g.addColorStop(0, '#FFE4F0'); g.addColorStop(1, '#FFC2DE')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      const n = Math.round((w * h) / (1600 * s * s))
      for (let i = 0; i < n; i++) {
        const R = (7 + r() * 14) * s
        ctx.save(); ctx.translate(r() * w, r() * h); ctx.rotate(r() * Math.PI)
        for (let p = 0; p < 5; p++) {
          ctx.rotate((Math.PI * 2) / 5)
          const pg = ctx.createLinearGradient(0, 0, R, 0)
          pg.addColorStop(0, '#FF8DBE'); pg.addColorStop(1, '#FFF0F6')
          ctx.fillStyle = pg
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.bezierCurveTo(R * 0.4, -R * 0.55, R * 0.95, -R * 0.4, R, -R * 0.08)
          ctx.lineTo(R * 0.86, 0)
          ctx.lineTo(R, R * 0.08)
          ctx.bezierCurveTo(R * 0.95, R * 0.4, R * 0.4, R * 0.55, 0, 0)
          ctx.fill()
        }
        ctx.fillStyle = '#E0457B'
        ctx.beginPath(); ctx.arc(0, 0, R * 0.12, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      }
    },
  },
  {
    id: 'clouds', label: 'dreamy sky',
    draw(ctx, w, h, s) {
      const r = rng(51)
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#5DA9F5'); g.addColorStop(0.6, '#A8D6FF'); g.addColorStop(1, '#FFD6EC')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      const n = Math.max(4, Math.round((w * h) / (16000 * s * s)))
      for (let i = 0; i < n; i++) {
        const cx = r() * w, cy = r() * h, R = (18 + r() * 22) * s
        ctx.save()
        ctx.shadowColor = 'rgba(70,110,180,.35)'; ctx.shadowBlur = 10 * s; ctx.shadowOffsetY = 4 * s
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        for (let k = 0; k < 6; k++) {
          const ox = (k - 2.5) * R * 0.55, oy = Math.sin(k * 1.7) * R * 0.25
          ctx.moveTo(cx + ox + R * 0.6, cy + oy)
          ctx.arc(cx + ox, cy + oy, R * (0.45 + ((k * 37) % 10) / 30), 0, Math.PI * 2)
        }
        ctx.fill()
        ctx.restore()
      }
      for (let i = 0; i < 20; i++) sparkle(ctx, r() * w, r() * h, (2 + r() * 5) * s)
    },
  },
  {
    id: 'bubbles', label: 'bubbles',
    draw(ctx, w, h, s) {
      const r = rng(61)
      const g = ctx.createLinearGradient(0, 0, w, h)
      g.addColorStop(0, '#C9A2FF'); g.addColorStop(1, '#FF9ECF')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      const n = Math.round((w * h) / (1800 * s * s))
      for (let i = 0; i < n; i++) {
        const cx = r() * w, cy = r() * h, R = (5 + r() * 22) * s
        const bg = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R)
        bg.addColorStop(0, 'rgba(255,255,255,.05)'); bg.addColorStop(0.85, 'rgba(255,255,255,.12)'); bg.addColorStop(1, 'rgba(255,255,255,.55)')
        ctx.fillStyle = bg
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,.85)'
        ctx.beginPath(); ctx.ellipse(cx - R * 0.4, cy - R * 0.45, R * 0.22, R * 0.12, -0.6, 0, Math.PI * 2); ctx.fill()
      }
    },
  },
  {
    id: 'holo', label: 'holographic',
    draw(ctx, w, h, s) {
      const r = rng(71)
      const g = ctx.createLinearGradient(0, 0, w, h)
      ;['#FFC6E5', '#C6F1FF', '#E2CCFF', '#FFF5C2', '#C6FFE6', '#FFC6E5'].forEach((c, i, a) => g.addColorStop(i / (a.length - 1), c))
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'soft-light'
      for (let i = 0; i < 8; i++) {
        const lg = ctx.createLinearGradient(0, r() * h, w, r() * h)
        lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, 'rgba(255,255,255,.7)'); lg.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = lg; ctx.fillRect(0, 0, w, h)
      }
      ctx.globalCompositeOperation = 'source-over'
      grain(ctx, w, h, s, r, 0.08)
      for (let i = 0; i < 18; i++) sparkle(ctx, r() * w, r() * h, (2 + r() * 6) * s)
    },
  },
  {
    id: 'checker', label: 'checkerboard',
    draw(ctx, w, h, s) {
      const sz = 24 * s
      for (let y = 0; y < h; y += sz) for (let x = 0; x < w; x += sz) {
        ctx.fillStyle = (Math.floor(x / sz) + Math.floor(y / sz)) % 2 ? '#FF4FA3' : '#FFFFFF'
        ctx.fillRect(x, y, sz, sz)
      }
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.08)')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
    },
  },
  { id: 'solid-white', label: 'white', draw: (ctx, w, h) => { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, w, h) } },
  { id: 'solid-black', label: 'black', draw: (ctx, w, h) => { ctx.fillStyle = '#111014'; ctx.fillRect(0, 0, w, h) } },
]

// ─── frames ───────────────────────────────────────────────────────────────

export interface FrameCtx {
  W: number
  H: number
  s: number
  rects: Rect[]
  layout: LayoutId
  magTitle: string
  magLines: string[]
}

export interface FrameDef {
  id: string
  label: string
  group: 'frame' | 'magazine'
  pad: number
  gap: number
  /** extra space under each photo (polaroid) */
  matBottom?: number
  /** drawn under each photo */
  mat?: (ctx: Ctx, r: Rect, s: number) => void
  /** drawn on top of everything (before stickers) */
  overlay?: (ctx: Ctx, f: FrameCtx) => void
}

function whiteMat(px: number, bottom = px, radius = 0, color = '#FFFFFF') {
  return (ctx: Ctx, r: Rect, s: number) => {
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,.28)'; ctx.shadowBlur = 6 * s; ctx.shadowOffsetY = 2 * s
    ctx.fillStyle = color
    roundRect(ctx, r.x - px * s, r.y - px * s, r.w + px * 2 * s, r.h + (px + bottom) * s, radius * s)
    ctx.fill()
    ctx.restore()
  }
}

/** Fill the band between the canvas edge and an inset rectangle. */
function band(ctx: Ctx, W: number, H: number, inset: number, fill: (ctx: Ctx) => void) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, W, H)
  ctx.rect(inset, inset, W - inset * 2, H - inset * 2)
  ctx.clip('evenodd')
  fill(ctx)
  ctx.restore()
}

function rhinestone(ctx: Ctx, x: number, y: number, R: number, tint = '#FF9ECF') {
  const g = ctx.createRadialGradient(x - R * 0.35, y - R * 0.35, R * 0.1, x, y, R)
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.45, tint); g.addColorStop(1, '#7A1E54')
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,.95)'
  ctx.beginPath(); ctx.arc(x - R * 0.35, y - R * 0.35, R * 0.25, 0, Math.PI * 2); ctx.fill()
}

function alongEdge(W: number, H: number, inset: number, step: number, cb: (x: number, y: number) => void) {
  for (let x = inset; x <= W - inset; x += step) { cb(x, inset); cb(x, H - inset) }
  for (let y = inset + step; y < H - inset; y += step) { cb(inset, y); cb(W - inset, y) }
}

function fitFont(ctx: Ctx, text: string, family: string, maxW: number, start: number, weight = '') {
  let size = start
  ctx.font = `${weight} ${size}px ${family}`
  while (ctx.measureText(text).width > maxW && size > 8) {
    size -= 2
    ctx.font = `${weight} ${size}px ${family}`
  }
  return size
}

function magazine(style: 'bubble' | 'classic' | 'glam') {
  return (ctx: Ctx, f: FrameCtx) => {
    const { s } = f
    const area: Rect = f.layout === 'cover' || f.layout === 'grid' || f.layout === 'collage'
      ? { x: 0, y: 0, w: f.W, h: f.H }
      : { ...f.rects[0] }
    const title = (f.magTitle || 'sparkle').slice(0, 14)
    const lines = f.magLines.filter(Boolean)
    const pink = style === 'glam' ? '#FFD84F' : '#FF2E93'
    const ink = style === 'classic' ? '#FFFFFF' : '#111111'
    ctx.save()
    ctx.beginPath(); ctx.rect(area.x, area.y, area.w, area.h); ctx.clip()

    // vertical accent stripes on the left
    if (style !== 'classic') {
      ctx.fillStyle = pink
      ctx.fillRect(area.x + area.w * 0.035, area.y, 3 * s, area.h)
      ctx.fillRect(area.x + area.w * 0.06, area.y, 1.5 * s, area.h)
    }

    // masthead
    const mastFamily = style === 'bubble' ? "'Chango', 'Arial Black', sans-serif" : style === 'classic' ? "Georgia, 'Times New Roman', serif" : "'Pacifico', cursive"
    const mastText = style === 'classic' ? title.toUpperCase() : title.toLowerCase()
    const size = fitFont(ctx, mastText, mastFamily, area.w * 0.86, area.w * 0.24, style === 'classic' ? 'bold' : '')
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'
    const my = area.y + area.h * 0.02
    ctx.lineJoin = 'round'
    if (style === 'bubble') {
      ctx.lineWidth = size * 0.16; ctx.strokeStyle = '#FFFFFF'; ctx.strokeText(mastText, area.x + area.w / 2, my)
      ctx.lineWidth = size * 0.07; ctx.strokeStyle = '#111'; ctx.strokeText(mastText, area.x + area.w / 2, my)
      ctx.fillStyle = pink; ctx.fillText(mastText, area.x + area.w / 2, my)
    } else if (style === 'classic') {
      ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 6 * s
      ctx.fillStyle = '#FFFFFF'; ctx.fillText(mastText, area.x + area.w / 2, my)
      ctx.shadowColor = 'transparent'
    } else {
      ctx.lineWidth = size * 0.1; ctx.strokeStyle = '#2B0A2E'; ctx.strokeText(mastText, area.x + area.w / 2, my)
      const g = ctx.createLinearGradient(0, my, 0, my + size)
      g.addColorStop(0, '#FFF7C2'); g.addColorStop(0.5, '#FFD84F'); g.addColorStop(1, '#E09A00')
      ctx.fillStyle = g; ctx.fillText(mastText, area.x + area.w / 2, my)
    }

    // issue line
    const small = Math.max(7 * s, area.w * 0.028)
    ctx.font = `bold ${small}px Verdana, sans-serif`
    ctx.fillStyle = style === 'classic' ? '#FFFFFF' : '#111'
    ctx.textAlign = 'right'
    ctx.fillText('THE BESTIE ISSUE · VOL. 01', area.x + area.w * 0.95, my + size * 1.05)

    // cover lines, right column
    const colX = area.x + area.w * 0.95
    let y = area.y + area.h * 0.36
    const lineSize = Math.max(9 * s, area.w * 0.06)
    lines.slice(0, 5).forEach((line, i) => {
      const fam = "Impact, 'Arial Narrow', 'Arial Black', sans-serif"
      const sz = fitFont(ctx, line.toUpperCase(), fam, area.w * 0.42, i === 0 ? lineSize * 1.15 : lineSize)
      ctx.textAlign = 'right'; ctx.textBaseline = 'top'
      ctx.lineWidth = sz * 0.18; ctx.strokeStyle = style === 'classic' ? 'rgba(0,0,0,.55)' : 'rgba(255,255,255,.9)'
      ctx.strokeText(line.toUpperCase(), colX, y)
      ctx.fillStyle = i % 2 === 0 ? pink : ink
      ctx.fillText(line.toUpperCase(), colX, y)
      y += sz * 1.08
    })

    // special issue starburst
    const bx = area.x + area.w * 0.2, by = area.y + area.h * 0.42, br = area.w * 0.1
    ctx.fillStyle = pink
    starPath(ctx, bx, by, br, 14, 0.78)
    ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.font = `bold ${br * 0.34}px Verdana, sans-serif`
    ctx.fillText('NEW!', bx, by - br * 0.15)
    ctx.font = `bold ${br * 0.2}px Verdana, sans-serif`
    ctx.fillText('special', bx, by + br * 0.22)

    // bottom-left big line
    const big = (lines[5] || 'friends forever').toUpperCase()
    const bsz = fitFont(ctx, big, "Impact, 'Arial Black', sans-serif", area.w * 0.62, area.w * 0.1)
    ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'
    ctx.lineWidth = bsz * 0.16; ctx.strokeStyle = style === 'classic' ? 'rgba(0,0,0,.55)' : '#FFFFFF'
    ctx.strokeText(big, area.x + area.w * 0.08, area.y + area.h * 0.96)
    ctx.fillStyle = style === 'classic' ? '#FFFFFF' : '#111'
    ctx.fillText(big, area.x + area.w * 0.08, area.y + area.h * 0.96)

    // barcode
    const bw = area.w * 0.16, bh = area.h * 0.06
    const bx0 = area.x + area.w * 0.95 - bw, by0 = area.y + area.h * 0.965 - bh
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(bx0 - 3 * s, by0 - 3 * s, bw + 6 * s, bh + 6 * s)
    const br2 = rng(99)
    for (let x = 0; x < bw; ) {
      const lw = (0.6 + br2() * 2) * s
      if (br2() > 0.35) { ctx.fillStyle = '#111'; ctx.fillRect(bx0 + x, by0, lw, bh) }
      x += lw + 0.6 * s
    }
    ctx.restore()
  }
}

export const DEFAULT_MAG_LINES = ['best friends issue', 'sleepover secrets', '47 glitter looks', 'quiz: which bff are you?', 'y2k is back!', 'new year new us']

export const FRAMES: FrameDef[] = [
  { id: 'none', label: 'none', group: 'frame', pad: 20, gap: 14 },
  {
    id: 'rhinestone', label: 'rhinestone', group: 'frame', pad: 28, gap: 16,
    mat: whiteMat(3),
    overlay(ctx, { W, H, s }) {
      band(ctx, W, H, 16 * s, (c) => glitterFill(c, W, H, s, ['#FF7EC4', '#C3157A'], ['#ffffff', '#FFD1E8', '#FF4FA3', '#FFE66B'], 3))
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2 * s
      ctx.strokeRect(16 * s, 16 * s, W - 32 * s, H - 32 * s)
      alongEdge(W, H, 8 * s, 20 * s, (x, y) => rhinestone(ctx, x, y, 4 * s))
    },
  },
  {
    id: 'lace', label: 'lace', group: 'frame', pad: 32, gap: 16,
    mat: whiteMat(4, 4, 2),
    overlay(ctx, { W, H, s }) {
      const inset = 14 * s
      band(ctx, W, H, inset, (c) => { c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, W, H) })
      ctx.fillStyle = '#FFFFFF'
      const R = 6 * s
      alongEdge(W, H, inset, R * 1.8, (x, y) => { ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill() })
      ctx.fillStyle = 'rgba(255,79,163,.35)'
      alongEdge(W, H, inset * 0.5, R * 1.8, (x, y) => { ctx.beginPath(); ctx.arc(x, y, 1.8 * s, 0, Math.PI * 2); ctx.fill() })
      ctx.strokeStyle = 'rgba(255,79,163,.5)'; ctx.setLineDash([3 * s, 3 * s]); ctx.lineWidth = 1.2 * s
      ctx.strokeRect(inset * 0.5, inset * 0.5, W - inset, H - inset)
      ctx.setLineDash([])
    },
  },
  {
    id: 'polaroid', label: 'polaroid', group: 'frame', pad: 24, gap: 30, matBottom: 22,
    mat: whiteMat(7, 22, 1, '#FFFEFA'),
  },
  {
    id: 'film', label: 'film strip', group: 'frame', pad: 34, gap: 14,
    overlay(ctx, { W, H, s }) {
      const bw = 22 * s
      ctx.fillStyle = '#16141A'
      ctx.fillRect(0, 0, bw, H); ctx.fillRect(W - bw, 0, bw, H)
      ctx.fillRect(0, 0, W, 8 * s); ctx.fillRect(0, H - 8 * s, W, 8 * s)
      ctx.fillStyle = '#F4EFE6'
      for (let y = 10 * s; y < H - 14 * s; y += 18 * s) {
        roundRect(ctx, bw * 0.3, y, bw * 0.4, 10 * s, 2 * s); ctx.fill()
        roundRect(ctx, W - bw * 0.7, y, bw * 0.4, 10 * s, 2 * s); ctx.fill()
      }
      ctx.save()
      ctx.fillStyle = '#FF9B2F'; ctx.font = `bold ${8 * s}px Verdana, sans-serif`
      ctx.translate(W - bw * 0.12, H * 0.5); ctx.rotate(Math.PI / 2); ctx.textAlign = 'center'
      ctx.fillText('SCRAPPY 400  ▸ 12  ▸ 13  ▸ 14', 0, 0)
      ctx.restore()
    },
  },
  {
    id: 'hearts', label: 'heart border', group: 'frame', pad: 32, gap: 16,
    mat: whiteMat(3),
    overlay(ctx, { W, H, s }) {
      const cols = ['#E8173E', '#FF4F7B', '#FF9EB5']
      let i = 0
      alongEdge(W, H, 11 * s, 15 * s, (x, y) => {
        heartPath(ctx, x, y, 19 * s)
        ctx.fillStyle = cols[i++ % 3]; ctx.fill()
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1.5 * s; ctx.stroke()
      })
    },
  },
  {
    id: 'chrome', label: 'chrome', group: 'frame', pad: 26, gap: 16,
    mat: whiteMat(2, 2, 0, '#D7DBE3'),
    overlay(ctx, { W, H, s }) {
      const t = 14 * s
      band(ctx, W, H, t, (c) => {
        const g = c.createLinearGradient(0, 0, W, H)
        ;['#F7F8FB', '#9AA0AE', '#FFFFFF', '#6F7684', '#E8EBF1', '#A5ABB8'].forEach((col, i, a) => g.addColorStop(i / (a.length - 1), col))
        c.fillStyle = g; c.fillRect(0, 0, W, H)
      })
      ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.5 * s; ctx.strokeRect(1.5 * s, 1.5 * s, W - 3 * s, H - 3 * s)
      ctx.strokeStyle = 'rgba(40,44,56,.6)'; ctx.strokeRect(t, t, W - t * 2, H - t * 2)
      ;[[t / 2, t / 2], [W - t / 2, t / 2], [t / 2, H - t / 2], [W - t / 2, H - t / 2], [W / 2, t / 2], [W / 2, H - t / 2]].forEach(([x, y]) => {
        const g = ctx.createRadialGradient(x - 1.5 * s, y - 1.5 * s, 0, x, y, 4 * s)
        g.addColorStop(0, '#fff'); g.addColorStop(1, '#5E6472')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 3.5 * s, 0, Math.PI * 2); ctx.fill()
      })
    },
  },
  {
    id: 'stars', label: 'star burst', group: 'frame', pad: 24, gap: 16,
    mat: whiteMat(3),
    overlay(ctx, { W, H, s }) {
      const r = rng(17)
      const corner = (cx: number, cy: number) => {
        for (let i = 0; i < 6; i++) {
          const x = cx + (r() - 0.5) * 60 * s, y = cy + (r() - 0.5) * 60 * s, R = (6 + r() * 12) * s
          starPath(ctx, x, y, R)
          ctx.fillStyle = ['#FFD84F', '#FFFFFF', '#FF9ECF', '#6FE3FF'][i % 4]
          ctx.fill(); ctx.strokeStyle = '#2B0A2E'; ctx.lineWidth = 1.2 * s; ctx.stroke()
        }
      }
      corner(18 * s, 18 * s); corner(W - 18 * s, H * 0.5); corner(18 * s, H - 30 * s)
      for (let i = 0; i < 16; i++) sparkle(ctx, r() * W, r() * H, (3 + r() * 5) * s, 'rgba(255,255,255,.95)')
    },
  },
  {
    id: 'tape', label: 'washi tape', group: 'frame', pad: 24, gap: 20,
    mat: whiteMat(6, 6),
    overlay(ctx, { rects, s }) {
      const r = rng(23)
      const cols = ['rgba(255,182,217,.85)', 'rgba(201,182,255,.85)', 'rgba(168,223,255,.85)', 'rgba(255,240,168,.9)']
      rects.forEach((rc, i) => {
        ;[[rc.x + 4 * s, rc.y + 2 * s, -0.6], [rc.x + rc.w - 4 * s, rc.y + 2 * s, 0.6]].forEach(([x, y, a], k) => {
          ctx.save(); ctx.translate(x, y); ctx.rotate(a + (r() - 0.5) * 0.2)
          ctx.fillStyle = cols[(i + k) % cols.length]
          ctx.fillRect(-20 * s, -6 * s, 40 * s, 12 * s)
          ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2 * s
          for (let xx = -18; xx < 20; xx += 6) { ctx.beginPath(); ctx.moveTo(xx * s, -6 * s); ctx.lineTo((xx + 4) * s, 6 * s); ctx.stroke() }
          ctx.restore()
        })
      })
    },
  },
  { id: 'mag-bubble', label: 'cover: bubble', group: 'magazine', pad: 10, gap: 10, overlay: magazine('bubble') },
  { id: 'mag-classic', label: 'cover: classic', group: 'magazine', pad: 10, gap: 10, overlay: magazine('classic') },
  { id: 'mag-glam', label: 'cover: glam', group: 'magazine', pad: 10, gap: 10, overlay: magazine('glam') },
]

// ─── layout + render ──────────────────────────────────────────────────────

export const BASE_W = 400

export function computeLayout(layout: LayoutId, count: number, aspect: number, frame: FrameDef, scale: number) {
  const W = BASE_W * scale
  const PAD = frame.pad * scale
  const GAP = frame.gap * scale
  const mb = (frame.matBottom ?? 0) * scale
  const rects: Rect[] = []
  let H = 0
  let header: Rect | null = null
  const footer = layout === 'cover' ? 0 : 26 * scale

  if (layout === 'cover') {
    const w = W - PAD * 2
    const h = Math.round(w * 4 / 3)
    rects.push({ x: PAD, y: PAD, w, h })
    H = h + PAD * 2
  } else if (layout === 'grid' || layout === 'collage') {
    const cw = (W - PAD * 2 - GAP) / 2
    const ch = Math.round(cw * Math.min(aspect, 1))
    const rows = Math.ceil(count / 2)
    for (let i = 0; i < count; i++) rects.push({ x: PAD + (i % 2) * (cw + GAP), y: PAD + Math.floor(i / 2) * (ch + GAP + mb), w: cw, h: ch })
    H = PAD * 2 + rows * (ch + mb) + (rows - 1) * GAP + footer
  } else {
    const w = W - PAD * 2
    const h = Math.round(w * Math.min(aspect, 1.1))
    let y = PAD
    if (layout === 'friendship') {
      header = { x: PAD, y: PAD, w, h: 50 * scale }
      y += header.h + GAP
    }
    for (let i = 0; i < count; i++) {
      rects.push({ x: PAD, y, w, h })
      y += h + mb + GAP
    }
    H = y - GAP + PAD + footer
  }
  return { W, H: Math.round(H), rects, header }
}

export interface RenderOpts {
  imgs: (HTMLImageElement | null)[]
  layout: LayoutId
  count: number
  filterCss: string
  bgId: string
  frameId: string
  magTitle: string
  magLines: string[]
  stripTitle?: string
  scale: number
}

export function renderStrip(canvas: HTMLCanvasElement, o: RenderOpts) {
  const frame = FRAMES.find((f) => f.id === o.frameId) ?? FRAMES[0]
  const first = o.imgs.find(Boolean)
  const aspect = first ? first.height / first.width : 0.75
  const { W, H, rects, header } = computeLayout(o.layout, o.count, aspect, frame, o.scale)
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const s = o.scale

  ;(BACKGROUNDS.find((b) => b.id === o.bgId) ?? BACKGROUNDS[0]).draw(ctx, W, H, s)

  if (header) {
    ctx.save()
    ctx.fillStyle = 'rgba(255,255,255,.92)'
    roundRect(ctx, header.x, header.y, header.w, header.h, 8 * s); ctx.fill()
    ctx.fillStyle = '#FF2E93'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    const title = o.stripTitle || 'best friends 4ever ♡'
    fitFont(ctx, title, "'Pacifico', cursive", header.w * 0.9, 24 * s)
    ctx.fillText(title, header.x + header.w / 2, header.y + header.h / 2)
    ctx.restore()
  }

  rects.forEach((r, i) => {
    frame.mat?.(ctx, r, s)
    const img = o.imgs[i]
    ctx.save()
    if (img) {
      const ia = img.width / img.height
      const sa = r.w / r.h
      let sx = 0, sy = 0, sw = img.width, sh = img.height
      if (ia > sa) { sw = img.height * sa; sx = (img.width - sw) / 2 } else { sh = img.width / sa; sy = (img.height - sh) / 2 }
      if (o.filterCss !== 'none') ctx.filter = o.filterCss
      ctx.drawImage(img, sx, sy, sw, sh, r.x, r.y, r.w, r.h)
      ctx.filter = 'none'
    } else {
      const g = ctx.createLinearGradient(r.x, r.y, r.x + r.w, r.y + r.h)
      g.addColorStop(0, '#FFD1E8'); g.addColorStop(1, '#C9A2FF')
      ctx.fillStyle = g
      ctx.fillRect(r.x, r.y, r.w, r.h)
      ctx.fillStyle = 'rgba(255,255,255,.75)'
      ctx.beginPath(); ctx.arc(r.x + r.w / 2, r.y + r.h * 0.42, Math.min(r.w, r.h) * 0.16, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(r.x + r.w / 2, r.y + r.h * 0.95, r.w * 0.3, r.h * 0.32, 0, Math.PI, 0); ctx.fill()
    }
    ctx.restore()
  })

  frame.overlay?.(ctx, { W, H, s, rects, layout: o.layout, magTitle: o.magTitle, magLines: o.magLines })

  ctx.save()
  ctx.font = `bold ${8 * s}px Verdana, sans-serif`
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
  ctx.lineWidth = 2.5 * s; ctx.strokeStyle = 'rgba(255,255,255,.7)'
  ctx.fillStyle = 'rgba(43,10,46,.65)'
  const wy = o.layout === 'cover' ? H - 3 * s : H - 8 * s
  ctx.strokeText('✦ made with SCRAPPY ✦', W / 2, wy)
  ctx.fillText('✦ made with SCRAPPY ✦', W / 2, wy)
  ctx.restore()

  return { W, H }
}

export async function ensureFonts() {
  if (typeof document === 'undefined' || !document.fonts) return
  try {
    await Promise.all(["'Chango'", "'Pacifico'", "'Caveat'", "'VT323'"].map((f) => document.fonts.load(`32px ${f}`)))
  } catch {}
}
