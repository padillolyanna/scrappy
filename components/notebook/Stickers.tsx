// Original SVG sticker set for Scrappy. Every sticker is drawn on a 100×100
// viewBox with a white die-cut border, dark outline and glossy highlight so it
// reads like a real Y2K sticker sheet. Tintable stickers take a `color`.

import type { ReactNode } from 'react'
import { assetFull } from '@/lib/assetLibrary'

const OUT = '#2B0A2E'

interface StickerDef {
  id: string
  label: string
  tint?: string // default color; presence means the sticker is tintable
  draw: (c: string) => ReactNode
}

function Cut({ d, fill, gloss = true }: { d: string; fill: string; gloss?: boolean }) {
  return (
    <>
      <path d={d} fill="#fff" stroke="#fff" strokeWidth={11} strokeLinejoin="round" />
      <path d={d} fill={fill} stroke={OUT} strokeWidth={3} strokeLinejoin="round" />
      {gloss && <path d={d} fill="url(#nb-gloss)" opacity={0.9} />}
    </>
  )
}

const HEART = 'M50 86C30 72 12 58 12 38c0-12 9-22 21-22 8 0 14 4 17 10 3-6 9-10 17-10 12 0 21 10 21 22 0 20-18 34-38 48z'
const STAR = 'M50 8l12 26 28 3-21 19 6 28-25-14-25 14 6-28-21-19 28-3z'
const SPARKLE = 'M50 6c4 24 12 36 44 44-32 8-40 20-44 44-4-24-12-36-44-44 32-8 40-20 44-44z'
const CLOUD = 'M28 76c-12 0-20-8-20-18 0-9 7-17 16-18 2-12 12-20 24-20 10 0 18 6 22 14 2-1 4-1 6-1 11 0 18 8 18 18 0 14-10 25-24 25z'
const MOON = 'M62 10c-20 4-34 21-34 41 0 22 18 40 40 40 6 0 12-1 17-4-7 13-21 21-36 21C26 108 6 88 6 63 6 38 26 18 50 18c4 0 8-4 12-8z'

export const STICKERS: StickerDef[] = [
  { id: 'heart', label: 'heart', tint: '#FF4FA3', draw: (c) => <Cut d={HEART} fill={c} /> },
  { id: 'star', label: 'star', tint: '#FFD84F', draw: (c) => <Cut d={STAR} fill={c} /> },
  { id: 'sparkle', label: 'sparkle', tint: '#C9A2FF', draw: (c) => <Cut d={SPARKLE} fill={c} /> },
  { id: 'cloud', label: 'cloud', tint: '#A8DFFF', draw: (c) => <Cut d={CLOUD} fill={c} /> },
  { id: 'moon', label: 'moon', tint: '#FFF0A8', draw: (c) => <g transform="translate(6 -4) scale(.86)"><Cut d={MOON} fill={c} /></g> },
  {
    id: 'flower', label: 'flower', tint: '#FF9ECF',
    draw: (c) => (
      <>
        <Cut d="M50 14c8 0 13 8 11 17 8-5 18-2 20 6 3 8-3 15-11 17 8 3 12 11 8 18-4 8-14 9-20 3 1 9-5 16-13 16s-13-8-11-17c-7 6-17 4-20-4-3-7 1-15 9-18-8-2-13-10-10-17 3-8 12-10 20-5-2-9 4-16 12-16z" fill={c} />
        <circle cx="50" cy="51" r="11" fill="#FFD84F" stroke={OUT} strokeWidth={3} />
      </>
    ),
  },
  {
    id: 'clover', label: 'clover', tint: '#9BE07A',
    draw: (c) => (
      <>
        <Cut d="M50 46C40 30 22 30 22 42c0 6 6 10 14 10-8 0-14 4-14 10 0 12 18 12 28-4 10 16 28 16 28 4 0-6-6-10-14-10 8 0 14-4 14-10 0-12-18-12-28 4z" fill={c} />
        <path d="M50 54c4 12 4 24 0 36" stroke={OUT} strokeWidth={3} fill="none" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: 'butterfly', label: 'butterfly', tint: '#C9A2FF',
    draw: (c) => (
      <>
        <Cut d="M48 48C38 24 10 14 10 34c0 12 12 18 26 16-14 6-20 24-6 28 10 3 16-10 18-22 2 12 8 25 18 22 14-4 8-22-6-28 14 2 26-4 26-16 0-20-28-10-38 14z" fill={c} />
        <rect x="46" y="34" width="8" height="40" rx="4" fill={OUT} />
        <path d="M48 34c-4-8-8-12-12-14M52 34c4-8 8-12 12-14" stroke={OUT} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: 'paw', label: 'paw', tint: '#FFB6D9',
    draw: (c) => (
      <>
        <Cut d="M50 52c14 0 26 12 26 24 0 9-8 12-14 10-5-2-8-3-12-3s-7 1-12 3c-6 2-14-1-14-10 0-12 12-24 26-24z" fill={c} />
        <Cut d="M24 50a9 11 0 1 1 0.1 0zM40 34a9 12 0 1 1 0.1 0zM60 34a9 12 0 1 1 0.1 0zM76 50a9 11 0 1 1 0.1 0z" fill={c} gloss={false} />
      </>
    ),
  },
  {
    id: 'bow', label: 'bow', tint: '#FF4FA3',
    draw: (c) => (
      <>
        <Cut d="M50 46C38 30 12 24 12 40c0 14 22 16 34 10-8 10-14 24-10 30 6 4 12-10 14-20 2 10 8 24 14 20 4-6-2-20-10-30 12 6 34 4 34-10 0-16-26-10-38 6z" fill={c} />
        <rect x="42" y="40" width="16" height="16" rx="5" fill={c} stroke={OUT} strokeWidth={3} />
      </>
    ),
  },
  {
    id: 'cherry', label: 'cherries', tint: '#FF3B6B',
    draw: (c) => (
      <>
        <path d="M34 66C40 40 50 22 66 12M66 66C64 44 64 28 66 12" stroke="#fff" strokeWidth={11} fill="none" strokeLinecap="round" />
        <path d="M34 66C40 40 50 22 66 12M66 66C64 44 64 28 66 12" stroke={OUT} strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d="M66 12c8-6 18-4 22 2-8 4-16 4-22-2z" fill="#9BE07A" stroke={OUT} strokeWidth={3} />
        <Cut d="M34 58a14 14 0 1 1-0.1 0zM68 60a14 14 0 1 1-0.1 0z" fill={c} />
      </>
    ),
  },
  {
    id: 'crown', label: 'crown', tint: '#FFD84F',
    draw: (c) => (
      <>
        <Cut d="M14 74l-4-46 22 18 18-30 18 30 22-18-4 46z" fill={c} />
        <circle cx="50" cy="58" r="7" fill="#FF4FA3" stroke={OUT} strokeWidth={2.5} />
        <circle cx="28" cy="62" r="5" fill="#6FE3FF" stroke={OUT} strokeWidth={2.5} />
        <circle cx="72" cy="62" r="5" fill="#6FE3FF" stroke={OUT} strokeWidth={2.5} />
      </>
    ),
  },
  {
    id: 'gem', label: 'gem', tint: '#FF9ECF',
    draw: (c) => (
      <>
        <Cut d="M26 18h48l18 22-42 48L8 40z" fill={c} />
        <path d="M8 40h84M26 18l12 22 12-22 12 22 12-22M38 40l12 48 12-48" stroke={OUT} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
      </>
    ),
  },
  {
    id: 'smiley', label: 'smiley', tint: '#FFD84F',
    draw: (c) => (
      <>
        <Cut d="M50 8a42 42 0 1 1-0.1 0z" fill={c} />
        <ellipse cx="36" cy="42" rx="5" ry="8" fill={OUT} />
        <ellipse cx="64" cy="42" rx="5" ry="8" fill={OUT} />
        <path d="M28 60c10 16 34 16 44 0" stroke={OUT} strokeWidth={4} fill="none" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: 'phone', label: 'flip phone', tint: '#FF9ECF',
    draw: (c) => (
      <>
        <Cut d="M30 10h40a6 6 0 0 1 6 6v30H24V16a6 6 0 0 1 6-6zM24 50h52v36a6 6 0 0 1-6 6H30a6 6 0 0 1-6-6z" fill={c} />
        <rect x="32" y="17" width="36" height="22" rx="3" fill="#A8DFFF" stroke={OUT} strokeWidth={2.5} />
        <path d="M44 28l3 3 6-7" stroke="#FF4FA3" strokeWidth={2.5} fill="none" />
        {[0, 1, 2].map((r) => [0, 1, 2].map((k) => <circle key={`${r}${k}`} cx={36 + k * 14} cy={60 + r * 9} r={3.2} fill="#fff" stroke={OUT} strokeWidth={1.6} />))}
      </>
    ),
  },
  {
    id: 'cd', label: 'CD',
    draw: () => (
      <>
        <circle cx="50" cy="50" r="44" fill="#fff" />
        <circle cx="50" cy="50" r="40" fill="url(#nb-holo)" stroke={OUT} strokeWidth={3} />
        <circle cx="50" cy="50" r="12" fill="#fff" stroke={OUT} strokeWidth={3} />
        <circle cx="50" cy="50" r="5" fill="#2B0A2E" />
        <path d="M24 30a34 34 0 0 1 20-14" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />
      </>
    ),
  },
  {
    id: 'cassette', label: 'cassette', tint: '#C9A2FF',
    draw: (c) => (
      <>
        <Cut d="M10 24h80a4 4 0 0 1 4 4v46a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V28a4 4 0 0 1 4-4z" fill={c} gloss={false} />
        <rect x="18" y="32" width="64" height="26" rx="4" fill="#FFF8ED" stroke={OUT} strokeWidth={2.5} />
        <circle cx="36" cy="45" r="7" fill="#fff" stroke={OUT} strokeWidth={2.5} />
        <circle cx="64" cy="45" r="7" fill="#fff" stroke={OUT} strokeWidth={2.5} />
        <path d="M26 78l6-12h36l6 12" fill="none" stroke={OUT} strokeWidth={2.5} />
      </>
    ),
  },
  {
    id: 'letter', label: 'love letter', tint: '#FFE4F0',
    draw: (c) => (
      <>
        <Cut d="M10 26h80v52H10z" fill={c} gloss={false} />
        <path d="M10 26l40 30 40-30" fill="none" stroke={OUT} strokeWidth={3} strokeLinejoin="round" />
        <path d="M50 66c-6-4-11-8-11-13 0-3 2-6 6-6 2 0 4 1 5 3 1-2 3-3 5-3 4 0 6 3 6 6 0 5-5 9-11 13z" fill="#FF4FA3" stroke={OUT} strokeWidth={2} />
      </>
    ),
  },
  {
    id: 'clip', label: 'binder clip',
    draw: () => (
      <>
        <path d="M30 40c0-22 8-34 20-34s20 12 20 34" fill="none" stroke="#fff" strokeWidth={11} />
        <path d="M30 40c0-22 8-34 20-34s20 12 20 34" fill="none" stroke="#8A8F9C" strokeWidth={5} />
        <path d="M14 40h72l-8 52H22z" fill="#fff" stroke="#fff" strokeWidth={9} strokeLinejoin="round" />
        <path d="M14 40h72l-8 52H22z" fill="url(#nb-chrome)" stroke={OUT} strokeWidth={3} strokeLinejoin="round" />
        <path d="M22 50h56" stroke="#fff" strokeWidth={3} opacity={0.7} />
      </>
    ),
  },
  {
    id: 'pin', label: 'pushpin', tint: '#FF4FA3',
    draw: (c) => (
      <>
        <path d="M50 58v34" stroke={OUT} strokeWidth={4} strokeLinecap="round" />
        <Cut d="M30 14h40l-6 14c10 4 16 12 16 22H20c0-10 6-18 16-22z" fill={c} />
      </>
    ),
  },
  {
    id: 'rainbow', label: 'rainbow',
    draw: () => (
      <>
        <path d="M8 80a42 42 0 0 1 84 0" fill="none" stroke="#fff" strokeWidth={42} />
        {['#FF6B9A', '#FFB86B', '#FFE66B', '#8BE38B', '#7CC8FF', '#C9A2FF'].map((col, i) => (
          <path key={col} d={`M${14 + i * 6} 80a${36 - i * 6} ${36 - i * 6} 0 0 1 ${72 - i * 12} 0`} fill="none" stroke={col} strokeWidth={6} />
        ))}
        <path d="M8 80a42 42 0 0 1 84 0M44 80a6 6 0 0 1 12 0" fill="none" stroke={OUT} strokeWidth={2.5} />
      </>
    ),
  },
]


// ─── Gems ─────────────────────────────────────────────────────────────────
// Faceted rhinestones: an outline is shrunk into rings, and each facet quad is
// lit from the top-left so the gem catches the light in any tint.

type Pt = [number, number]

function fitPts(pts: Pt[], box = [8, 92] as [number, number]): Pt[] {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1])
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const k = (box[1] - box[0]) / Math.max(x1 - x0, y1 - y0)
  const ox = 50 - ((x0 + x1) / 2) * k, oy = 50 - ((y0 + y1) / 2) * k
  return pts.map(([x, y]) => [x * k + ox, y * k + oy])
}

const sample = (n: number, f: (t: number) => Pt) => Array.from({ length: n }, (_, i) => f((i / n) * Math.PI * 2))

const GEM_SHAPES: Record<string, { pts: Pt[]; rings: number[]; center?: Pt }> = {
  round: { pts: fitPts(sample(16, (t) => [Math.cos(t), Math.sin(t)])), rings: [0.72, 0.42] },
  heart: {
    pts: fitPts(sample(24, (t) => [16 * Math.sin(t) ** 3, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))])),
    rings: [0.66, 0.36],
    center: [50, 47],
  },
  star: {
    pts: fitPts(Array.from({ length: 10 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.48 : 1
      return [Math.cos(a) * r, Math.sin(a) * r] as Pt
    })),
    rings: [0.55, 0.25],
    center: [50, 54],
  },
  drop: {
    pts: fitPts(sample(20, (t) => [Math.sin(t) * Math.sin(t / 2) * 0.9, -Math.cos(t)])),
    rings: [0.66, 0.36],
    center: [50, 58],
  },
  emerald: {
    pts: fitPts([[-30, -42], [30, -42], [40, -32], [40, 32], [30, 42], [-30, 42], [-40, 32], [-40, -32]]),
    rings: [0.8, 0.6, 0.4],
  },
  princess: { pts: fitPts([[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]]), rings: [0.62, 0.3] },
}

function Gem({ shape, color, uid }: { shape: keyof typeof GEM_SHAPES; color: string; uid?: string }) {
  const g = GEM_SHAPES[shape]
  const n = g.pts.length
  const xs = g.pts.map((p) => p[0]), ys = g.pts.map((p) => p[1])
  const c: Pt = g.center ?? [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2]
  const ring = (k: number) => g.pts.map(([x, y]) => [c[0] + (x - c[0]) * k, c[1] + (y - c[1]) * k] as Pt)
  const rings = [g.pts, ...g.rings.map(ring)]
  const d = (pts: Pt[]) => `M${pts.map((p) => p.map((v) => v.toFixed(2)).join(' ')).join('L')}Z`
  const facets: { d: string; fill: string; op: number }[] = []
  for (let r = 0; r < rings.length - 1; r++) {
    for (let i = 0; i < n; i++) {
      const a = rings[r][i], b = rings[r][(i + 1) % n], cc = rings[r + 1][(i + 1) % n], dd = rings[r + 1][i]
      const mx = (a[0] + b[0]) / 2 - c[0], my = (a[1] + b[1]) / 2 - c[1]
      const len = Math.hypot(mx, my) || 1
      const light = (-mx - my) / (len * Math.SQRT2) // facing top-left = lit
      const alt = (i + r) % 2 ? 0.1 : 0
      facets.push(light > 0
        ? { d: d([a, b, cc, dd]), fill: '#fff', op: 0.12 + light * 0.45 + alt }
        : { d: d([a, b, cc, dd]), fill: '#000', op: 0.08 - light * 0.32 + alt * 0.5 })
    }
  }
  const table = rings[rings.length - 1]
  const tid = `nb-gem-table-${uid ?? shape}`
  return (
    <g>
      <defs>
        <linearGradient id={tid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="1" stopColor="#000" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      {/* silver setting */}
      <path d={d(g.pts)} fill="#fff" stroke="#fff" strokeWidth={10} strokeLinejoin="round" />
      <path d={d(g.pts)} fill={color} stroke="url(#nb-chrome)" strokeWidth={6} strokeLinejoin="round" />
      {facets.map((f, i) => (
        <path key={i} d={f.d} fill={f.fill} fillOpacity={Math.min(0.85, f.op)} stroke="#fff" strokeOpacity={0.35} strokeWidth={0.6} strokeLinejoin="round" />
      ))}
      <path d={d(table)} fill={color} />
      <path d={d(table)} fill={`url(#${tid})`} stroke="#fff" strokeOpacity={0.5} strokeWidth={0.8} />
      <path d={d(g.pts)} fill="none" stroke="#2B0A2E" strokeOpacity={0.55} strokeWidth={1.4} strokeLinejoin="round" />
      {/* glint */}
      <path d="M33 22c.8 5 2.2 6.4 7.2 7.2-5 .8-6.4 2.2-7.2 7.2-.8-5-2.2-6.4-7.2-7.2 5-.8 6.4-2.2 7.2-7.2z" fill="#fff" />
      <circle cx="62" cy="30" r="1.8" fill="#fff" opacity="0.9" />
    </g>
  )
}

function Pearl() {
  return (
    <g>
      <defs>
        <radialGradient id="nb-pearl" cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#FBF3EA" />
          <stop offset="0.8" stopColor="#EAD6DD" />
          <stop offset="1" stopColor="#C9B2C4" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="40" fill="#fff" stroke="#fff" strokeWidth={8} />
      <circle cx="50" cy="50" r="40" fill="url(#nb-pearl)" stroke="#B7A1B5" strokeWidth={1.5} />
      <ellipse cx="36" cy="33" rx="10" ry="6" fill="#fff" opacity="0.85" transform="rotate(-30 36 33)" />
      <path d="M22 62a30 30 0 0 0 30 18" stroke="#FFD1E8" strokeWidth={3} fill="none" opacity="0.6" strokeLinecap="round" />
    </g>
  )
}

/** A heart outline made of small rhinestones. */
function RhinestoneHeart({ color }: { color: string }) {
  const pts = GEM_SHAPES.heart.pts
  const step = 2
  return (
    <g>
      {pts.filter((_, i) => i % step === 0).map(([x, y], i) => (
        <g key={i} transform={`translate(${x - 8} ${y - 8}) scale(0.16)`}>
          <Gem shape="round" color={i % 3 === 0 ? '#ffffff' : color} uid={`rh-${i % 3 === 0 ? 'w' : 'c'}`} />
        </g>
      ))}
    </g>
  )
}

/** One big heart gem with two little gems. */
function GemCluster({ color }: { color: string }) {
  return (
    <g>
      <g transform="translate(8 14) scale(0.76)"><Gem shape="heart" color={color} uid="cl-h" /></g>
      <g transform="translate(66 4) scale(0.3)"><Gem shape="round" color="#ffffff" uid="cl-w" /></g>
      <g transform="translate(70 62) scale(0.26)"><Gem shape="star" color="#FFD84F" uid="cl-s" /></g>
    </g>
  )
}

export const GEM_COLORS: { id: string; label: string; hex: string }[] = [
  { id: 'pink', label: 'pink', hex: '#FF5FB1' },
  { id: 'ruby', label: 'ruby', hex: '#E0115F' },
  { id: 'amethyst', label: 'amethyst', hex: '#9B5DE5' },
  { id: 'sapphire', label: 'sapphire', hex: '#2F6BFF' },
  { id: 'aqua', label: 'aqua', hex: '#2ED3E6' },
  { id: 'emerald', label: 'emerald', hex: '#18B26B' },
  { id: 'gold', label: 'gold', hex: '#FFC83D' },
  { id: 'diamond', label: 'diamond', hex: '#E6F0FF' },
]

export const GEM_STICKERS: StickerDef[] = [
  { id: 'gem-heart', label: 'heart gem', tint: '#FF5FB1', draw: (c) => <Gem shape="heart" color={c} /> },
  { id: 'gem-round', label: 'round gem', tint: '#2F6BFF', draw: (c) => <Gem shape="round" color={c} /> },
  { id: 'gem-star', label: 'star gem', tint: '#FFC83D', draw: (c) => <Gem shape="star" color={c} /> },
  { id: 'gem-drop', label: 'teardrop gem', tint: '#2ED3E6', draw: (c) => <Gem shape="drop" color={c} /> },
  { id: 'gem-emerald', label: 'emerald cut', tint: '#18B26B', draw: (c) => <Gem shape="emerald" color={c} /> },
  { id: 'gem-princess', label: 'princess cut', tint: '#9B5DE5', draw: (c) => <Gem shape="princess" color={c} /> },
  { id: 'gem-hearts', label: 'rhinestone heart', tint: '#FF5FB1', draw: (c) => <RhinestoneHeart color={c} /> },
  { id: 'gem-cluster', label: 'bling cluster', tint: '#E0115F', draw: (c) => <GemCluster color={c} /> },
  { id: 'pearl', label: 'pearl', draw: () => <Pearl /> },
]

export const EMOJI_STICKERS = ['✦', '★', '♡', '✿', '♪', '⊹', '✸', '❋', '☆', '◎', '💖', '🎀', '🌸', '🦋', '🍓', '🌈', '💿', '📼', '📸', '💌', '✨', '🧸', '🍒', '⭐']

function DefsContent() {
  return (
    <>
      <linearGradient id="nb-gloss" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.75" />
        <stop offset="0.38" stopColor="#fff" stopOpacity="0.15" />
        <stop offset="0.4" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="nb-chrome" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F4F6FA" />
        <stop offset="0.45" stopColor="#B9BECA" />
        <stop offset="0.55" stopColor="#8A8F9C" />
        <stop offset="1" stopColor="#D8DCE4" />
      </linearGradient>
      <linearGradient id="nb-holo" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFD1E8" />
        <stop offset="0.3" stopColor="#C9F2FF" />
        <stop offset="0.55" stopColor="#E9D8FF" />
        <stop offset="0.8" stopColor="#FFF6C9" />
        <stop offset="1" stopColor="#FFB6D9" />
      </linearGradient>
    </>
  )
}

export function StickerDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <defs>
        <DefsContent />
      </defs>
    </svg>
  )
}

function findSticker(id: string) {
  return STICKERS.find((s) => s.id === id) ?? GEM_STICKERS.find((s) => s.id === id)
}

/** `standalone` renders a self-contained 256px SVG (own defs, no CSS) so it
 *  can be serialised and drawn onto a canvas. */
export function Sticker({ content, color, standalone }: { content: string; color?: string; standalone?: boolean }) {
  if (content.startsWith('url:')) {
    // a sticker the user uploaded (transparent PNG recommended)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={content.slice(4)} alt="" draggable={false} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', pointerEvents: 'none' }} />
    )
  }
  if (content.startsWith('img:')) {
    // realistic photographed-style asset (see lib/assetLibrary)
    const id = content.slice(4)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={assetFull(id)} alt="" draggable={false} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', imageRendering: 'pixelated', pointerEvents: 'none' }} />
    )
  }
  if (content.startsWith('svg:')) {
    const def = findSticker(content.slice(4))
    if (!def) return null
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-6 -6 112 112"
        width={standalone ? 256 : '100%'}
        height={standalone ? 256 : '100%'}
        style={standalone ? undefined : { overflow: 'visible', filter: 'drop-shadow(1px 2px 1.5px rgba(43,10,46,.25))' }}
      >
        {standalone && <defs><DefsContent /></defs>}
        {def.draw(color ?? def.tint ?? '#FF4FA3')}
      </svg>
    )
  }
  const text = content.startsWith('txt:') ? content.slice(4) : content
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={standalone ? 256 : '100%'} height={standalone ? 256 : '100%'} style={standalone ? undefined : { overflow: 'visible' }}>
      <text
        x="50" y="54" textAnchor="middle" dominantBaseline="middle" fontSize="78"
        fill={color ?? '#FF4FA3'} stroke="#fff" strokeWidth={6} paintOrder="stroke"
        style={{ fontFamily: "'Nunito', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif" }}
      >
        {text}
      </text>
    </svg>
  )
}

export function stickerTintable(content: string) {
  if (content.startsWith('img:') || content.startsWith('url:')) return false
  if (content.startsWith('txt:')) return true
  const def = findSticker(content.slice(4))
  return !!def?.tint
}
