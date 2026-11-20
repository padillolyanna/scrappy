// Original SVG sticker set for Scrappy. Every sticker is drawn on a 100×100
// viewBox with a white die-cut border, dark outline and glossy highlight so it
// reads like a real Y2K sticker sheet. Tintable stickers take a `color`.

import type { ReactNode } from 'react'

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

export const EMOJI_STICKERS = ['✦', '★', '♡', '✿', '♪', '⊹', '✸', '❋', '☆', '◎', '💖', '🎀', '🌸', '🦋', '🍓', '🌈', '💿', '📼', '📸', '💌', '✨', '🧸', '🍒', '⭐']

export function StickerDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <defs>
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
      </defs>
    </svg>
  )
}

export function Sticker({ content, color }: { content: string; color?: string }) {
  if (content.startsWith('svg:')) {
    const def = STICKERS.find((s) => s.id === content.slice(4))
    if (!def) return null
    return (
      <svg viewBox="-6 -6 112 112" width="100%" height="100%" style={{ overflow: 'visible', filter: 'drop-shadow(1px 2px 1.5px rgba(43,10,46,.25))' }}>
        {def.draw(color ?? def.tint ?? '#FF4FA3')}
      </svg>
    )
  }
  const text = content.startsWith('txt:') ? content.slice(4) : content
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ overflow: 'visible' }}>
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
  if (content.startsWith('txt:')) return true
  const def = STICKERS.find((s) => s.id === content.slice(4))
  return !!def?.tint
}
