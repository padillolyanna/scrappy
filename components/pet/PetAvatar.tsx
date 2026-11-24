'use client'

import { useId, type ReactNode } from 'react'
import type { Equipped } from '@/lib/pet/catalog'

/* The Scrappy pet, drawn as one layered SVG (viewBox 120 x 150).
   Base design = the original mascot: round pink head, two dark eyes, pink bow antenna,
   purple-to-pink body with a sparkle, little wand. Accessories sit in fixed slots and
   are painted in a fixed layer order so nothing overlaps the wrong way. */

export type PetMood = 'idle' | 'happy' | 'sleepy' | 'excited'

const INK = '#2B0A2E'
const BODY_PATH = 'M48 90 H72 Q78 90 78 96 V120 Q78 134 64 134 H56 Q42 134 42 120 V96 Q42 90 48 90 Z'
const EYE_L = 47
const EYE_R = 73
const EYE_Y = 57

const star = (cx: number, cy: number, ro: number, ri: number, n = 5, rot = -90) =>
  Array.from({ length: n * 2 }, (_, i) => {
    const r = i % 2 ? ri : ro
    const a = ((rot + (i * 180) / n) * Math.PI) / 180
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
  }).join(' ')
const heart = (cx: number, cy: number, s: number) =>
  `M${cx} ${cy + 3.2 * s} C${cx - 5.5 * s} ${cy - 0.5 * s} ${cx - 4.5 * s} ${cy - 5 * s} ${cx} ${cy - 2.2 * s} C${cx + 4.5 * s} ${cy - 5 * s} ${cx + 5.5 * s} ${cy - 0.5 * s} ${cx} ${cy + 3.2 * s} Z`
const sparkle4 = (cx: number, cy: number, r: number) => star(cx, cy, r, r * 0.28, 4, -90)
const Gloss = ({ x, y, rx, ry, o = 0.55 }: { x: number; y: number; rx: number; ry: number; o?: number }) => (
  <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#fff" opacity={o} />
)

type Layer = 'back' | 'front'
type Art = (g: (n: string) => string) => Partial<Record<Layer, ReactNode>>

/* ───────── head ───────── */
const HEAD: Record<string, Art & { hideAntenna?: boolean }> = {
  'bow-pink': () => ({
    front: (
      <g transform="rotate(18 84 32)">
        <path d="M84 32 L72 24 Q70 32 72 40 Z" fill="#FF5FB1" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M84 32 L96 24 Q98 32 96 40 Z" fill="#FF5FB1" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <circle cx="84" cy="32" r="3.6" fill="#E0007A" stroke={INK} strokeWidth="2" />
        <Gloss x={75} y={28} rx={2} ry={1.2} />
      </g>
    ),
  }),
  'clip-heart': () => ({
    front: (
      <g>
        <rect x="76" y="37" width="14" height="3" rx="1.5" fill="#B9C0CC" stroke={INK} strokeWidth="1.5" transform="rotate(-30 83 38)" />
        <path d={heart(84, 33, 1.5)} fill="#FF4FA3" stroke={INK} strokeWidth="2" />
        <Gloss x={81} y={30} rx={1.8} ry={1.1} />
      </g>
    ),
  }),
  'clip-star': () => ({
    front: (
      <g>
        <polygon points={star(84, 33, 8, 3.6)} fill="#FFD84A" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <Gloss x={81} y={30} rx={1.8} ry={1.1} />
      </g>
    ),
  }),
  'clip-butterfly': () => ({
    front: (
      <g transform="rotate(-15 84 33)">
        <ellipse cx="78" cy="29" rx="6" ry="5" fill="#8FD3FF" stroke={INK} strokeWidth="1.8" />
        <ellipse cx="90" cy="29" rx="6" ry="5" fill="#8FD3FF" stroke={INK} strokeWidth="1.8" />
        <ellipse cx="79" cy="37" rx="4.5" ry="3.6" fill="#C9A2FF" stroke={INK} strokeWidth="1.8" />
        <ellipse cx="89" cy="37" rx="4.5" ry="3.6" fill="#C9A2FF" stroke={INK} strokeWidth="1.8" />
        <rect x="82.5" y="26" width="3" height="14" rx="1.5" fill="#E0007A" stroke={INK} strokeWidth="1.4" />
        <Gloss x={77} y={27} rx={2} ry={1.2} />
      </g>
    ),
  }),
  'ears-cat': () => ({
    back: (
      <g>
        <path d="M33 46 L34 18 L56 30 Z" fill="#FFB6D9" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M87 46 L86 18 L64 30 Z" fill="#FFB6D9" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M37 38 L38 25 L48 31 Z" fill="#FF7BB8" />
        <path d="M83 38 L82 25 L72 31 Z" fill="#FF7BB8" />
      </g>
    ),
  }),
  'antenna-stars': () => ({
    front: (
      <g>
        <line x1="45" y1="22" x2="43" y2="31" stroke={INK} strokeWidth="1.3" />
        <line x1="75" y1="22" x2="77" y2="31" stroke={INK} strokeWidth="1.3" />
        <polygon points={star(43, 33, 4.6, 2)} fill="#FFD84A" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
        <polygon points={star(77, 33, 4.6, 2)} fill="#FFD84A" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
        <polygon points={sparkle4(60, 9, 4)} fill="#fff" stroke="#FF4FA3" strokeWidth="1" />
      </g>
    ),
  }),
  headphones: () => ({
    // band sits behind the head (dark outline, pink on top); ear cups in front
    back: (
      <g>
        <path d="M25 60 A35 35 0 0 1 95 60" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
        <path d="M25 60 A35 35 0 0 1 95 60" fill="none" stroke="#FF5FB1" strokeWidth="5" strokeLinecap="round" />
      </g>
    ),
    front: (
      <g>
        <rect x="17" y="47" width="15" height="24" rx="7" fill="#FF5FB1" stroke={INK} strokeWidth="2.5" />
        <rect x="88" y="47" width="15" height="24" rx="7" fill="#FF5FB1" stroke={INK} strokeWidth="2.5" />
        <Gloss x={22} y={53} rx={2.2} ry={4} />
        <Gloss x={93} y={53} rx={2.2} ry={4} />
      </g>
    ),
  }),
  crown: () => ({
    front: (
      <g>
        <path d="M44 34 L46 16 L53 25 L60 12 L67 25 L74 16 L76 34 Z" fill="#FFD84A" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
        <circle cx="60" cy="29" r="3" fill="#FF4FA3" stroke={INK} strokeWidth="1.5" />
        <circle cx="50" cy="30" r="2" fill="#8FD3FF" stroke={INK} strokeWidth="1.2" />
        <circle cx="70" cy="30" r="2" fill="#8FD3FF" stroke={INK} strokeWidth="1.2" />
        <Gloss x={51} y={22} rx={1.4} ry={3} />
      </g>
    ),
  }),
}
HEAD.crown.hideAntenna = true

/* ───────── eyes ───────── */
function Eyes({ kind }: { kind?: string }) {
  const dot = (x: number, r = 5.5) => (
    <g key={x}>
      <circle cx={x} cy={EYE_Y} r={r} fill={INK} />
      <circle cx={x + 1.8} cy={EYE_Y - 2} r={r * 0.3} fill="#fff" />
    </g>
  )
  const arcUp = (x: number) => <path key={x} d={`M${x - 6} ${EYE_Y + 2} Q${x} ${EYE_Y - 6} ${x + 6} ${EYE_Y + 2}`} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
  const arcDown = (x: number) => <path key={x} d={`M${x - 6} ${EYE_Y - 1} Q${x} ${EYE_Y + 5} ${x + 6} ${EYE_Y - 1}`} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
  switch (kind) {
    case 'eyes-sparkle':
      return (
        <g>
          {[EYE_L, EYE_R].map((x) => (
            <g key={x}>
              <circle cx={x} cy={EYE_Y} r="7.5" fill={INK} />
              <circle cx={x + 2.4} cy={EYE_Y - 2.6} r="2.4" fill="#fff" />
              <circle cx={x - 2.4} cy={EYE_Y + 2.6} r="1.2" fill="#fff" />
              <polygon points={sparkle4(x - 2.6, EYE_Y - 3, 2)} fill="#FFB6D9" />
            </g>
          ))}
        </g>
      )
    case 'eyes-happy': return <g>{arcUp(EYE_L)}{arcUp(EYE_R)}</g>
    case 'eyes-sleepy': return <g>{arcDown(EYE_L)}{arcDown(EYE_R)}</g>
    case 'eyes-wink': return <g>{dot(EYE_L)}{arcUp(EYE_R)}</g>
    default: return <g className="pet-eyes">{dot(EYE_L)}{dot(EYE_R)}</g>
  }
}

/* ───────── glasses + cheeks ───────── */
const GLASSES: Record<string, ReactNode> = {
  'glasses-round': (
    <g>
      <circle cx={EYE_L} cy={EYE_Y} r="10.5" fill="#fff" fillOpacity=".22" stroke={INK} strokeWidth="2.6" />
      <circle cx={EYE_R} cy={EYE_Y} r="10.5" fill="#fff" fillOpacity=".22" stroke={INK} strokeWidth="2.6" />
      <path d={`M${EYE_L + 10} ${EYE_Y - 1} Q60 ${EYE_Y - 5} ${EYE_R - 10} ${EYE_Y - 1}`} fill="none" stroke={INK} strokeWidth="2.4" />
      <path d={`M${EYE_L - 6} ${EYE_Y - 5} l4 -3`} stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      <path d={`M${EYE_R - 6} ${EYE_Y - 5} l4 -3`} stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  ),
  'glasses-heart': (
    <g>
      <path d={heart(EYE_L, EYE_Y, 2.6)} fill="#FF4FA3" fillOpacity=".38" stroke="#E0007A" strokeWidth="2.6" />
      <path d={heart(EYE_R, EYE_Y, 2.6)} fill="#FF4FA3" fillOpacity=".38" stroke="#E0007A" strokeWidth="2.6" />
      <path d={`M${EYE_L + 11} ${EYE_Y - 3} Q60 ${EYE_Y - 7} ${EYE_R - 11} ${EYE_Y - 3}`} fill="none" stroke="#E0007A" strokeWidth="2.4" />
      <Gloss x={EYE_L - 5} y={EYE_Y - 5} rx={2.4} ry={1.4} o={0.8} />
      <Gloss x={EYE_R - 5} y={EYE_Y - 5} rx={2.4} ry={1.4} o={0.8} />
    </g>
  ),
}
const CHEEKS: Record<string, ReactNode> = {
  blush: (
    <g>
      <ellipse cx="38" cy="68" rx="6.5" ry="3.6" fill="#FF6FAE" opacity=".55" />
      <ellipse cx="82" cy="68" rx="6.5" ry="3.6" fill="#FF6FAE" opacity=".55" />
    </g>
  ),
  freckles: (
    <g fill="#C26A8E">
      {[[35, 66], [39, 69], [42, 65], [78, 65], [81, 69], [85, 66]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.3" />)}
    </g>
  ),
  'sticker-star': (
    <g>
      <polygon points={star(82, 69, 7.5, 3.4)} fill="#fff" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
      <polygon points={star(82, 69, 6, 2.7)} fill="#FFD84A" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
    </g>
  ),
}

/* ───────── outfits (drawn over the body) ───────── */
const OUTFIT: Record<string, Art> = {
  'hoodie-pink': (g) => hoodie(g, '#FF8CC8', '#E0007A', 'hp'),
  'hoodie-purple': (g) => hoodie(g, '#B98CFF', '#6A3FD0', 'hv'),
  'outfit-pastel': (g) => ({
    front: (
      <g>
        <defs>
          <pattern id={g('stripes')} width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="#FFD1E8" /><rect y="0" width="8" height="3" fill="#BFF0DC" /><rect y="4" width="8" height="2" fill="#E1D2FF" />
          </pattern>
        </defs>
        <path d={BODY_PATH} fill={`url(#${g('stripes')})`} stroke={INK} strokeWidth="2.5" />
        <path d="M50 90 Q60 99 70 90" fill="#fff" stroke={INK} strokeWidth="2" />
      </g>
    ),
  }),
  pajamas: (g) => ({
    front: (
      <g>
        <defs>
          <pattern id={g('dots')} width="9" height="9" patternUnits="userSpaceOnUse">
            <rect width="9" height="9" fill="#BFE3FF" /><circle cx="2.5" cy="2.5" r="1.4" fill="#fff" /><circle cx="7" cy="7" r="1.4" fill="#fff" />
          </pattern>
        </defs>
        <path d={BODY_PATH} fill={`url(#${g('dots')})`} stroke={INK} strokeWidth="2.5" />
        <path d="M60 91 L49 91 L55 101 Z M60 91 L71 91 L65 101 Z" fill="#fff" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        {[106, 115, 124].map((y) => <circle key={y} cx="60" cy={y} r="1.8" fill="#fff" stroke={INK} strokeWidth="1.2" />)}
      </g>
    ),
  }),
  'outfit-metallic': (g) => ({
    front: (
      <g>
        <defs>
          <linearGradient id={g('chrome')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F7F9FD" /><stop offset=".45" stopColor="#B9C0CC" /><stop offset=".55" stopColor="#E9EDF5" /><stop offset="1" stopColor="#8D96A8" />
          </linearGradient>
        </defs>
        <path d={BODY_PATH} fill={`url(#${g('chrome')})`} stroke={INK} strokeWidth="2.5" />
        <path d="M44 96 H76" stroke="#FF4FA3" strokeWidth="3" />
        <path d="M47 104 L58 128 M55 102 L64 122" stroke="#fff" strokeWidth="2" opacity=".8" strokeLinecap="round" />
        <polygon points={sparkle4(66, 112, 5)} fill="#FF4FA3" />
      </g>
    ),
  }),
  'sweater-holiday': () => ({
    front: (
      <g>
        <path d={BODY_PATH} fill="#FF6FAE" stroke={INK} strokeWidth="2.5" />
        <path d="M43 104 l4 4 4 -4 4 4 4 -4 4 4 4 -4 4 4 4 -4 4 4 4 -4" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" />
        <rect x="44" y="90" width="32" height="5" rx="2" fill="#fff" stroke={INK} strokeWidth="1.6" />
        <g stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
          <path d="M60 114 v12 M54 117 l12 6 M54 123 l12 -6" />
        </g>
      </g>
    ),
  }),
}
function hoodie(g: (n: string) => string, top: string, bottom: string, k: string) {
  return {
    front: (
      <g>
        <defs>
          <linearGradient id={g(k)} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient>
        </defs>
        <path d={BODY_PATH} fill={`url(#${g(k)})`} stroke={INK} strokeWidth="2.5" />
        <path d="M40 92 Q60 104 80 92 L80 97 Q60 108 40 97 Z" fill={top} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M56 99 V107 M64 99 V107" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M49 118 H71 Q71 128 64 128 H56 Q49 128 49 118 Z" fill={bottom} stroke={INK} strokeWidth="1.8" opacity=".9" />
        <polygon points={sparkle4(60, 112, 4.5)} fill="#fff" opacity=".9" />
        <Gloss x={48} y={100} rx={2} ry={5} o={0.35} />
      </g>
    ),
  }
}

/* ───────── body accessories ───────── */
const BODY: Record<string, Art> = {
  'necklace-pearl': () => ({
    front: <g>{Array.from({ length: 9 }, (_, i) => { const t = i / 8; const x = 46 + t * 28; const y = 92 + Math.sin(t * Math.PI) * 7; return <circle key={i} cx={x} cy={y} r="2.3" fill="#FFF8FC" stroke={INK} strokeWidth="1" /> })}</g>,
  }),
  'ribbon-neck': () => ({
    front: (
      <g>
        <path d="M60 94 L48 88 Q46 94 48 100 Z M60 94 L72 88 Q74 94 72 100 Z" fill="#FF4FA3" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M58 96 L54 106 M62 96 L66 106" stroke="#FF4FA3" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="60" cy="94" r="3.4" fill="#E0007A" stroke={INK} strokeWidth="1.8" />
      </g>
    ),
  }),
  'bag-mini': () => ({
    front: (
      <g>
        <path d="M47 92 L74 116" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M47 92 L74 116" stroke="#FFB84A" strokeWidth="1.6" strokeLinecap="round" />
        <rect x="68" y="113" width="17" height="13" rx="3" fill="#FFD84A" stroke={INK} strokeWidth="2" />
        <path d="M68 117 H85" stroke={INK} strokeWidth="1.6" />
        <circle cx="76.5" cy="119" r="1.6" fill="#FF4FA3" />
        <Gloss x={72} y={116} rx={2} ry={1} />
      </g>
    ),
  }),
  'badge-heart': () => ({ front: badge('#FF8CC8', <path d={heart(51, 107, 1.1)} fill="#fff" />) }),
  'badge-star': () => ({ front: badge('#FFD84A', <polygon points={star(51, 107, 4.2, 1.9)} fill="#fff" />) }),
  backpack: () => ({
    back: (
      <g>
        <rect x="33" y="94" width="54" height="34" rx="9" fill="#C9A2FF" stroke={INK} strokeWidth="2.5" />
        <Gloss x={38} y={102} rx={2.4} ry={5} o={0.5} />
      </g>
    ),
    front: (
      <g stroke={INK} strokeWidth="2" fill="#9A6BEB">
        <rect x="45" y="91" width="5" height="28" rx="2.5" />
        <rect x="70" y="91" width="5" height="28" rx="2.5" />
      </g>
    ),
  }),
  'charm-heart': () => ({
    front: (
      <g>
        <path d="M46 92 Q60 104 74 92" fill="none" stroke="#B9C0CC" strokeWidth="1.6" />
        <path d={heart(60, 103, 1.6)} fill="#FF4FA3" stroke={INK} strokeWidth="1.8" />
        <Gloss x={57} y={100} rx={1.6} ry={1} o={0.8} />
      </g>
    ),
  }),
}
function badge(fill: string, icon: ReactNode) {
  return (
    <g>
      <circle cx="51" cy="107" r="7" fill={fill} stroke={INK} strokeWidth="2" />
      {icon}
      <Gloss x={48} y={104} rx={2} ry={1.2} />
    </g>
  )
}

/* ───────── effects ───────── */
const EFFECT: Record<string, Art> = {
  'fx-sparkles': () => ({
    front: (
      <g>
        {[[14, 34, 6, 0], [106, 44, 5, 0.6], [12, 104, 5, 1.2], [108, 112, 6, 1.8], [96, 16, 4, 0.9]].map(([x, y, r, d]) => (
          <polygon key={`${x}`} className="pet-twinkle" style={{ animationDelay: `${d}s`, transformOrigin: `${x}px ${y}px` }} points={sparkle4(x, y, r)} fill="#fff" stroke="#FF4FA3" strokeWidth="1.2" />
        ))}
      </g>
    ),
  }),
  'fx-hearts': () => ({
    front: (
      <g>
        {[[18, 92, 0], [102, 84, 1.1], [92, 30, 2.2]].map(([x, y, d]) => (
          <path key={`${x}`} className="pet-float-up" style={{ animationDelay: `${d}s` }} d={heart(x, y, 1.3)} fill="#FF4FA3" stroke={INK} strokeWidth="1.2" />
        ))}
      </g>
    ),
  }),
  'fx-stars': () => ({
    front: (
      <g>
        {[[16, 50, 0], [104, 70, 0.8], [20, 124, 1.6]].map(([x, y, d]) => (
          <polygon key={`${x}`} className="pet-spin" style={{ animationDelay: `${d}s`, transformOrigin: `${x}px ${y}px` }} points={star(x, y, 6, 2.6)} fill="#FFD84A" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
        ))}
      </g>
    ),
  }),
  'fx-bubbles': () => ({
    front: (
      <g>
        {[[16, 110, 5, 0], [102, 100, 4, 1], [96, 60, 6, 2], [22, 64, 3.5, 1.5]].map(([x, y, r, d]) => (
          <g key={`${x}`} className="pet-float-up" style={{ animationDelay: `${d}s` }}>
            <circle cx={x} cy={y} r={r} fill="#DFF4FF" fillOpacity=".45" stroke="#7CC8F5" strokeWidth="1.3" />
            <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.25} fill="#fff" />
          </g>
        ))}
      </g>
    ),
  }),
  'fx-glitter': () => ({
    back: (
      <g className="pet-shimmer">
        {Array.from({ length: 22 }, (_, i) => {
          const t = i / 21
          const x = 8 + t * 104
          const y = 140 - Math.sin(t * Math.PI) * 18 + (i % 3) * 2
          const c = ['#FF4FA3', '#FFD84A', '#C9A2FF', '#8FD3FF'][i % 4]
          return <circle key={i} cx={x} cy={y} r={i % 2 ? 1.4 : 2.2} fill={c} />
        })}
      </g>
    ),
  }),
  'fx-holo': (g) => ({
    back: (
      <g>
        <defs>
          <radialGradient id={g('holo')} cx=".5" cy=".5" r=".5">
            <stop offset=".45" stopColor="#fff" stopOpacity="0" />
            <stop offset=".62" stopColor="#8FD3FF" stopOpacity=".55" />
            <stop offset=".76" stopColor="#C9A2FF" stopOpacity=".55" />
            <stop offset=".9" stopColor="#FFB6D9" stopOpacity=".5" />
            <stop offset="1" stopColor="#FFD84A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle className="pet-holo" cx="60" cy="80" r="62" fill={`url(#${g('holo')})`} />
      </g>
    ),
  }),
}

export default function PetAvatar({
  equipped = {}, size = 120, mood = 'idle', animated = true, title = 'Scrappy pet', className, crop = 'full',
}: {
  /** 'head' zooms in on the head (for small face/head item tiles) */
  crop?: 'full' | 'head'
  equipped?: Equipped
  size?: number
  mood?: PetMood
  animated?: boolean
  title?: string
  className?: string
}) {
  const uid = useId().replace(/:/g, '')
  const g = (n: string) => `pet-${uid}-${n}`
  const head = equipped.head ? HEAD[equipped.head] : undefined
  const headArt = head?.(g)
  const outfit = equipped.outfit ? OUTFIT[equipped.outfit]?.(g) : undefined
  const body = equipped.body ? BODY[equipped.body]?.(g) : undefined
  const fx = equipped.effect ? EFFECT[equipped.effect]?.(g) : undefined
  const eyes = mood === 'sleepy' ? 'eyes-sleepy' : mood === 'happy' || mood === 'excited' ? 'eyes-happy' : equipped.eyes
  const anim = animated ? `pet-anim pet-mood-${mood}` : ''

  return (
    <svg viewBox={crop === 'head' ? '12 2 96 96' : '0 0 120 150'} width={size} height={crop === 'head' ? size : size * 1.25} {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })} className={`pet-svg ${crop === 'head' ? 'pet-svg--head' : ''} ${anim} ${className ?? ''}`}>
      <defs>
        <radialGradient id={g('head')} cx=".38" cy=".32" r=".75">
          <stop offset="0" stopColor="#FFD3E9" /><stop offset=".6" stopColor="#FFB0D6" /><stop offset="1" stopColor="#FF8FC6" />
        </radialGradient>
        <linearGradient id={g('body')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C9A2FF" /><stop offset="1" stopColor="#FF4FA3" />
        </linearGradient>
      </defs>

      <ellipse cx="60" cy="143" rx="25" ry="4.5" fill={INK} opacity=".14" />
      <g className="pet-bob">
        {fx?.back}
        {headArt?.back}
        {body?.back}

        {/* body */}
        <path d={BODY_PATH} fill={`url(#${g('body')})`} stroke={INK} strokeWidth="2.5" />
        <polygon points={sparkle4(60, 112, 6)} fill="#fff" opacity=".85" />
        <Gloss x={48} y={100} rx={2.2} ry={6} o={0.35} />
        {outfit?.front}
        {body?.front}

        {/* wand */}
        <g className="pet-wand">
          <path d="M77 114 L95 97" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <path d="M77 114 L95 97" stroke="#C9A2FF" strokeWidth="2.6" strokeLinecap="round" />
          <polygon points={star(97, 94, 7, 3)} fill="#FFD84A" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        </g>

        {/* head */}
        <circle cx="60" cy="56" r="33" fill={`url(#${g('head')})`} stroke={INK} strokeWidth="2.5" />
        <Gloss x={46} y={38} rx={9} ry={5} o={0.6} />
        {!head?.hideAntenna && (
          <g>
            <ellipse cx="49" cy="20" rx="9.5" ry="5.5" fill="#FF4FA3" stroke={INK} strokeWidth="2" transform="rotate(-15 49 20)" />
            <ellipse cx="71" cy="20" rx="9.5" ry="5.5" fill="#FF4FA3" stroke={INK} strokeWidth="2" transform="rotate(15 71 20)" />
            <circle cx="60" cy="21" r="4.6" fill="#FF9ECF" stroke={INK} strokeWidth="2" />
            <Gloss x={46} y={18} rx={2.6} ry={1.3} o={0.7} />
          </g>
        )}
        {equipped.cheeks && CHEEKS[equipped.cheeks]}
        <g className="pet-look"><Eyes kind={eyes} /></g>
        {(mood === 'happy' || mood === 'excited') && <path d="M54 70 Q60 76 66 70" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />}
        {equipped.glasses && GLASSES[equipped.glasses]}
        {headArt?.front}
        {fx?.front}
      </g>

      {mood === 'sleepy' && (
        <g className="pet-zzz" fill={INK} fontFamily="Verdana, sans-serif" fontWeight="bold">
          <text x="92" y="30" fontSize="11">z</text><text x="100" y="20" fontSize="8">z</text>
        </g>
      )}
      {mood === 'excited' && (
        <g>
          {[[18, 30], [102, 28], [14, 80], [106, 78]].map(([x, y]) => (
            <polygon key={`${x}${y}`} className="pet-pop" points={sparkle4(x, y, 7)} fill="#FFD84A" stroke={INK} strokeWidth="1.2" />
          ))}
        </g>
      )}
    </svg>
  )
}
