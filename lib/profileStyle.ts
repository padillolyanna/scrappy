// MySpace-style profile customisation for Scrappy.
// `ProfileStyle` = how the page looks, `ProfileExtras` = the extra boxes'
// content. Both live as jsonb on `profiles` and are always passed through
// `sanitizeStyle` / `sanitizeExtras` before rendering.

import type React from 'react'

export type BgPattern =
  | 'none' | 'stars' | 'hearts' | 'polka' | 'gingham' | 'checker' | 'zebra' | 'leopard' | 'sparkle' | 'stripes' | 'butterflies'

export type NameEffect = 'glitter' | 'glow' | 'rainbow' | 'outline' | 'plain'

export interface ProfileStyle {
  preset: string
  bgColor: string
  bgPattern: BgPattern
  patternColor: string
  bgImage: string // https url or ''
  bgImageMode: 'tile' | 'cover'
  panelBg: string
  panelText: string
  headerBg: string
  headerText: string
  linkColor: string
  borderColor: string
  boxStyle: 'square' | 'rounded' | 'bevel'
  panelOpacity: number // 0.6 – 1
  nameFont: string // id from FONTS in lib/notebook
  nameColor: string
  nameEffect: NameEffect
  bodyFont: 'verdana' | 'nunito' | 'caveat' | 'gochi' | 'elite'
  tagline: string
  footerQuote: string
  decor: string[] // sticker ids e.g. 'svg:star' / 'txt:✦'
  sidebar: 'left' | 'right'
  layout: 'classic' | 'stack' // classic = MySpace two columns, stack = app-style hero + blocks
  avatarShape: 'square' | 'rounded' | 'circle'
}

export interface ProfileExtras {
  headline: string
  location: string
  aboutMe: string
  whoToMeet: string
  song: { title: string; artist: string; url: string }
  interests: { general: string; music: string; movies: string; tv: string; books: string }
  top8: string[] // profile ids
  show: { music: boolean; meet: boolean; interests: boolean; scrapbooks: boolean; top8: boolean; comments: boolean }
  links: ProfileLink[]
  blocks: ProfileBlock[]
}

// ─── page blocks ("widgets" people stack on their page) ───────────────────
export interface ProfileLink { label: string; url: string }
export type BlockType = 'text' | 'photos' | 'list' | 'card' | 'music' | 'quote'
export type BlockSkin = 'window' | 'glass' | 'paper' | 'plain' | 'cassette' | 'player'
export interface ProfileBlock {
  id: string
  type: BlockType
  skin: BlockSkin
  color: string
  title: string
  body: string
  items: string[]
  photos: string[]
  shape: 'square' | 'rounded' | 'circle'
  artist: string
  url: string
}
export const MAX_BLOCKS = 20
export const BLOCK_TYPES: { id: BlockType; label: string; hint: string; skins: BlockSkin[] }[] = [
  { id: 'text', label: 'text box', hint: 'about me, TMI, a little note', skins: ['window', 'glass', 'paper', 'plain'] },
  { id: 'card', label: 'profile card', hint: 'a photo next to a few lines about you', skins: ['window', 'glass', 'paper'] },
  { id: 'list', label: 'list', hint: 'fave artists, hobbies, DNI…', skins: ['window', 'glass', 'paper', 'plain'] },
  { id: 'photos', label: 'photo grid', hint: 'up to 9 pictures', skins: ['window', 'glass', 'plain'] },
  { id: 'music', label: 'music player', hint: 'a Spotify, YouTube or mp3 link', skins: ['player', 'cassette', 'window'] },
  { id: 'quote', label: 'big quote', hint: 'a line in big letters', skins: ['plain', 'glass', 'paper'] },
]
export const SKIN_LABEL: Record<BlockSkin, string> = {
  window: 'window.exe', glass: 'glass', paper: 'notebook paper', plain: 'no box', cassette: 'cassette', player: 'music player',
}
export function newBlock(type: BlockType, color = '#FF4FA3'): ProfileBlock {
  const def = BLOCK_TYPES.find((b) => b.id === type) ?? BLOCK_TYPES[0]
  const title = { text: 'a little bit about me!', card: 'yourname.zip', list: 'fave artists!', photos: 'my photos', music: '', quote: '' }[type]
  return {
    id: `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    type, skin: def.skins[0], color, title, body: type === 'quote' ? 'pretty girls make better friends ♡' : '',
    items: type === 'list' ? ['', '', ''] : type === 'card' ? ['', '', ''] : [], photos: [], shape: 'rounded', artist: '', url: '',
  }
}
export function sanitizeBlocks(raw: unknown): ProfileBlock[] {
  if (!Array.isArray(raw)) return []
  const out: ProfileBlock[] = []
  for (const r0 of raw.slice(0, MAX_BLOCKS)) {
    if (!r0 || typeof r0 !== 'object') continue
    const r = r0 as Record<string, unknown>
    const type = oneOf(r.type, BLOCK_TYPES.map((b) => b.id), 'text')
    const def = BLOCK_TYPES.find((b) => b.id === type)!
    out.push({
      id: typeof r.id === 'string' && /^[a-z0-9]{3,24}$/i.test(r.id) ? r.id : `b${out.length}`,
      type,
      skin: oneOf(r.skin, def.skins, def.skins[0]),
      color: color(r.color, '#FF4FA3'),
      title: str(r.title, '', 60),
      body: str(r.body, '', 1500),
      items: Array.isArray(r.items) ? r.items.filter((x): x is string => typeof x === 'string').map((x) => x.slice(0, 120)).slice(0, 15) : [],
      photos: Array.isArray(r.photos) ? r.photos.map(safeUrl).filter(Boolean).slice(0, 9) : [],
      shape: oneOf(r.shape, ['square', 'rounded', 'circle'] as const, 'rounded'),
      artist: str(r.artist, '', 80),
      url: safeUrl(r.url),
    })
  }
  return out
}
export function sanitizeLinks(raw: unknown): ProfileLink[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((l): l is Record<string, unknown> => !!l && typeof l === 'object')
    .map((l) => ({ label: str(l.label, '', 30).trim(), url: safeUrl(l.url) }))
    .filter((l) => l.url)
    .slice(0, 6)
}
/** small icon for a link chip, picked from the url */
export function linkKind(url: string): string {
  const u = url.toLowerCase()
  if (u.includes('instagram.com')) return 'IG'
  if (u.includes('tiktok.com')) return 'TT'
  if (u.includes('discord')) return 'DC'
  if (u.includes('spotify.com')) return 'SP'
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'YT'
  if (u.includes('x.com') || u.includes('twitter.com')) return 'X'
  if (u.includes('pinterest')) return 'PI'
  return '♡'
}

export const BG_PATTERNS: { id: BgPattern; label: string }[] = [
  { id: 'none', label: 'none' },
  { id: 'stars', label: 'stars' },
  { id: 'sparkle', label: 'sparkle' },
  { id: 'hearts', label: 'hearts' },
  { id: 'butterflies', label: 'butterflies' },
  { id: 'polka', label: 'polka' },
  { id: 'gingham', label: 'gingham' },
  { id: 'checker', label: 'checker' },
  { id: 'stripes', label: 'stripes' },
  { id: 'zebra', label: 'zebra' },
  { id: 'leopard', label: 'leopard' },
]

export const NAME_EFFECTS: { id: NameEffect; label: string }[] = [
  { id: 'glitter', label: 'glitter' },
  { id: 'glow', label: 'neon glow' },
  { id: 'rainbow', label: 'rainbow' },
  { id: 'outline', label: 'bubble' },
  { id: 'plain', label: 'plain' },
]

export const BODY_FONTS: { id: ProfileStyle['bodyFont']; label: string; css: string }[] = [
  { id: 'verdana', label: 'Verdana (classic)', css: 'Verdana, Tahoma, sans-serif' },
  { id: 'nunito', label: 'Rounded', css: "'Nunito', sans-serif" },
  { id: 'caveat', label: 'Handwriting', css: "'Caveat', cursive" },
  { id: 'gochi', label: 'Doodle', css: "'Gochi Hand', cursive" },
  { id: 'elite', label: 'Typewriter', css: "'Special Elite', monospace" },
]

export const DEFAULT_STYLE: ProfileStyle = {
  preset: 'glitter-night',
  bgColor: '#0B0410',
  bgPattern: 'sparkle',
  patternColor: '#FF4FA3',
  bgImage: '',
  bgImageMode: 'tile',
  panelBg: '#FFFFFF',
  panelText: '#1A0A1E',
  headerBg: '#E35BD0',
  headerText: '#2B0A2E',
  linkColor: '#D4006E',
  borderColor: '#E35BD0',
  boxStyle: 'square',
  panelOpacity: 0.95,
  nameFont: 'verdana',
  nameColor: '#FF6FD8',
  nameEffect: 'glitter',
  bodyFont: 'verdana',
  tagline: 'pretty girls make better friends ♡',
  footerQuote: 'music makes everything better…',
  decor: ['svg:star', 'svg:heart', 'svg:sparkle', 'txt:✦'],
  sidebar: 'left',
  layout: 'classic',
  avatarShape: 'square',
}

export const DEFAULT_EXTRAS: ProfileExtras = {
  headline: 'just a small town girl with big dreams…',
  location: '',
  aboutMe: '',
  whoToMeet: '',
  song: { title: '', artist: '', url: '' },
  interests: { general: '', music: '', movies: '', tv: '', books: '' },
  top8: [],
  show: { music: true, meet: true, interests: true, scrapbooks: true, top8: true, comments: true },
  links: [],
  blocks: [],
}

type Preset = { id: string; label: string; style: Partial<ProfileStyle> }

export const PRESETS: Preset[] = [
  { id: 'glitter-night', label: 'Glitter Night', style: { ...DEFAULT_STYLE } },
  {
    id: 'pink-princess', label: 'Pink Princess',
    style: {
      bgColor: '#FFD6EA', bgPattern: 'gingham', patternColor: '#FF9ECF', panelBg: '#FFFFFF', panelText: '#3A0030', headerBg: '#FF4FA3', headerText: '#FFFFFF',
      linkColor: '#D4006E', borderColor: '#2B0A2E', boxStyle: 'bevel', nameFont: 'chango', nameColor: '#FF4FA3', nameEffect: 'outline', bodyFont: 'nunito',
      tagline: 'princess of my own little corner ♡', footerQuote: 'xoxo forever', decor: ['svg:bow', 'svg:heart', 'svg:crown', 'svg:sparkle'],
    },
  },
  {
    id: 'cyber-y2k', label: 'Cyber Y2K',
    style: {
      bgColor: '#0A1A3A', bgPattern: 'checker', patternColor: '#1D3B7A', panelBg: '#E9F4FF', panelText: '#0A1A3A', headerBg: '#6FE3FF', headerText: '#0A1A3A',
      linkColor: '#7C4DDB', borderColor: '#6FE3FF', boxStyle: 'bevel', nameFont: 'silkscreen', nameColor: '#6FE3FF', nameEffect: 'glow', bodyFont: 'verdana',
      tagline: '>> logged in from the year 2000', footerQuote: 'brb ✦ g2g ✦ ttyl', decor: ['svg:cd', 'svg:phone', 'svg:sparkle', 'svg:star'],
    },
  },
  {
    id: 'scene-queen', label: 'Scene Queen',
    style: {
      bgColor: '#0D0D0D', bgPattern: 'zebra', patternColor: '#2A2A2A', panelBg: '#111111', panelText: '#F2F2F2', headerBg: '#39FF14', headerText: '#0D0D0D',
      linkColor: '#FF2BD6', borderColor: '#39FF14', boxStyle: 'square', nameFont: 'cherry', nameColor: '#39FF14', nameEffect: 'rainbow', bodyFont: 'verdana',
      tagline: 'rawr means i ♡ u in dinosaur', footerQuote: 'stay scene, stay weird', decor: ['svg:smiley', 'txt:★', 'svg:heart', 'svg:gem'],
    },
  },
  {
    id: 'blue-dream', label: 'Blue Dream',
    style: {
      bgColor: '#BFE3FF', bgPattern: 'stars', patternColor: '#FFFFFF', panelBg: '#FFFFFF', panelText: '#1C2B5A', headerBg: '#8FB8FF', headerText: '#FFFFFF',
      linkColor: '#3B6FE0', borderColor: '#5A7FD6', boxStyle: 'rounded', nameFont: 'pacifico', nameColor: '#3B6FE0', nameEffect: 'glow', bodyFont: 'nunito',
      tagline: 'head in the clouds ☁', footerQuote: 'sweet dreams are made of this', decor: ['svg:cloud', 'svg:moon', 'svg:star', 'svg:butterfly'],
    },
  },
  {
    id: 'leopard-luxe', label: 'Leopard Luxe',
    style: {
      bgColor: '#E9C27A', bgPattern: 'leopard', patternColor: '#4A2A10', panelBg: '#FFF5F9', panelText: '#2B1408', headerBg: '#FF5FA2', headerText: '#FFFFFF',
      linkColor: '#C2185B', borderColor: '#2B1408', boxStyle: 'rounded', nameFont: 'pacifico', nameColor: '#FF5FA2', nameEffect: 'outline', bodyFont: 'verdana',
      tagline: "that's hot ✦", footerQuote: 'loves it!!', decor: ['svg:gem', 'svg:crown', 'svg:heart', 'svg:cherry'],
    },
  },
  {
    id: 'bubblegum', label: 'Bubblegum',
    style: {
      bgColor: '#E6D4FF', bgPattern: 'polka', patternColor: '#FFFFFF', panelBg: '#FFFFFF', panelText: '#3A0070', headerBg: '#B87FFF', headerText: '#FFFFFF',
      linkColor: '#7C4DDB', borderColor: '#5A2090', boxStyle: 'bevel', nameFont: 'fredoka', nameColor: '#B87FFF', nameEffect: 'outline', bodyFont: 'nunito',
      tagline: 'pop pop pop ✿', footerQuote: 'keep it sweet', decor: ['svg:flower', 'svg:butterfly', 'svg:heart', 'svg:rainbow'],
    },
  },
  {
    id: 'diary', label: 'Secret Diary',
    style: {
      bgColor: '#FFF6E6', bgPattern: 'stripes', patternColor: '#FFD9E8', panelBg: '#FFFDF7', panelText: '#3B2A20', headerBg: '#FFD84F', headerText: '#3B2A20',
      linkColor: '#D4006E', borderColor: '#3B2A20', boxStyle: 'rounded', nameFont: 'caveat', nameColor: '#D4006E', nameEffect: 'plain', bodyFont: 'caveat',
      tagline: 'dear diary…', footerQuote: 'so many memories <3', decor: ['svg:letter', 'svg:clover', 'svg:pin', 'svg:flower'],
    },
  },
]

// ─── sanitising ───────────────────────────────────────────────────────────

const HEX = /^#[0-9a-f]{3,8}$/i
const color = (v: unknown, d: string) => (typeof v === 'string' && HEX.test(v) ? v : d)
const str = (v: unknown, d: string, max: number) => (typeof v === 'string' ? v.slice(0, max) : d)
function oneOf<T extends string>(v: unknown, list: readonly T[], d: T): T {
  return list.includes(v as T) ? (v as T) : d
}
export function safeUrl(v: unknown): string {
  if (typeof v !== 'string') return ''
  const s = v.trim()
  return /^https:\/\/[^\s"'()<>\\]+$/i.test(s) && s.length < 600 ? s : ''
}

const FONT_IDS = ['chango', 'pacifico', 'caveat', 'gochi', 'nunito', 'fredoka', 'cherry', 'elite', 'vt323', 'silkscreen', 'verdana'] as const

export function sanitizeStyle(raw: unknown): ProfileStyle {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const d = DEFAULT_STYLE
  return {
    preset: str(r.preset, d.preset, 40),
    bgColor: color(r.bgColor, d.bgColor),
    bgPattern: oneOf(r.bgPattern, BG_PATTERNS.map((p) => p.id), d.bgPattern),
    patternColor: color(r.patternColor, d.patternColor),
    bgImage: safeUrl(r.bgImage),
    bgImageMode: oneOf(r.bgImageMode, ['tile', 'cover'] as const, d.bgImageMode),
    panelBg: color(r.panelBg, d.panelBg),
    panelText: color(r.panelText, d.panelText),
    headerBg: color(r.headerBg, d.headerBg),
    headerText: color(r.headerText, d.headerText),
    linkColor: color(r.linkColor, d.linkColor),
    borderColor: color(r.borderColor, d.borderColor),
    boxStyle: oneOf(r.boxStyle, ['square', 'rounded', 'bevel'] as const, d.boxStyle),
    panelOpacity: typeof r.panelOpacity === 'number' ? Math.min(1, Math.max(0.6, r.panelOpacity)) : d.panelOpacity,
    nameFont: oneOf(r.nameFont, FONT_IDS, d.nameFont as (typeof FONT_IDS)[number]),
    nameColor: color(r.nameColor, d.nameColor),
    nameEffect: oneOf(r.nameEffect, NAME_EFFECTS.map((e) => e.id), d.nameEffect),
    bodyFont: oneOf(r.bodyFont, BODY_FONTS.map((f) => f.id), d.bodyFont),
    tagline: str(r.tagline, d.tagline, 60),
    footerQuote: str(r.footerQuote, d.footerQuote, 60),
    decor: Array.isArray(r.decor) ? r.decor.filter((x): x is string => typeof x === 'string' && /^(svg|txt):.{1,24}$/.test(x)).slice(0, 8) : d.decor,
    sidebar: oneOf(r.sidebar, ['left', 'right'] as const, d.sidebar),
    layout: oneOf(r.layout, ['classic', 'stack'] as const, d.layout),
    avatarShape: oneOf(r.avatarShape, ['square', 'rounded', 'circle'] as const, d.avatarShape),
  }
}

export function sanitizeExtras(raw: unknown): ProfileExtras {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const d = DEFAULT_EXTRAS
  const song = (r.song && typeof r.song === 'object' ? r.song : {}) as Record<string, unknown>
  const ints = (r.interests && typeof r.interests === 'object' ? r.interests : {}) as Record<string, unknown>
  const show = (r.show && typeof r.show === 'object' ? r.show : {}) as Record<string, unknown>
  const b = (v: unknown, def: boolean) => (typeof v === 'boolean' ? v : def)
  return {
    headline: str(r.headline, d.headline, 120),
    location: str(r.location, '', 60),
    aboutMe: str(r.aboutMe, '', 1500),
    whoToMeet: str(r.whoToMeet, '', 600),
    song: { title: str(song.title, '', 80), artist: str(song.artist, '', 80), url: safeUrl(song.url) },
    interests: {
      general: str(ints.general, '', 300), music: str(ints.music, '', 300), movies: str(ints.movies, '', 300),
      tv: str(ints.tv, '', 300), books: str(ints.books, '', 300),
    },
    top8: Array.isArray(r.top8) ? r.top8.filter((x): x is string => typeof x === 'string' && /^[0-9a-f-]{36}$/i.test(x)).slice(0, 8) : [],
    show: {
      music: b(show.music, true), meet: b(show.meet, true), interests: b(show.interests, true),
      scrapbooks: b(show.scrapbooks, true), top8: b(show.top8, true), comments: b(show.comments, true),
    },
    links: sanitizeLinks(r.links),
    blocks: sanitizeBlocks(r.blocks),
  }
}

// ─── rendering helpers ────────────────────────────────────────────────────

const svg = (body: string, w: number, h: number) =>
  `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>${body}</svg>`)}")`

export function backgroundStyle(s: ProfileStyle): React.CSSProperties {
  const c = s.patternColor
  let image = ''
  let size = ''
  switch (s.bgPattern) {
    case 'stars':
      image = svg(`<path d='M16 4l3 7 7 .6-5.4 4.6 1.7 7.1L16 19.6l-6.3 3.7 1.7-7.1L6 11.6l7-.6z' fill='${c}' opacity='.55'/><path d='M50 38l1.6 3.8 4 .3-3 2.6.9 4-3.5-2.1-3.5 2.1.9-4-3-2.6 4-.3z' fill='${c}' opacity='.4'/>`, 64, 64)
      break
    case 'sparkle':
      image = svg(`<path d='M14 2c1 7 3 9 10 10-7 1-9 3-10 10-1-7-3-9-10-10 7-1 9-3 10-10z' fill='${c}' opacity='.75'/><circle cx='44' cy='40' r='1.6' fill='#fff' opacity='.8'/><circle cx='36' cy='12' r='1' fill='#fff' opacity='.7'/><path d='M48 50c.6 4 1.6 5 5.6 5.6-4 .6-5 1.6-5.6 5.6-.6-4-1.6-5-5.6-5.6 4-.6 5-1.6 5.6-5.6z' fill='${c}' opacity='.5'/>`, 64, 64)
      break
    case 'hearts':
      image = svg(`<path d='M16 26s-10-6-10-13a5.5 5.5 0 0 1 10-3 5.5 5.5 0 0 1 10 3c0 7-10 13-10 13z' fill='${c}' opacity='.55'/><path d='M44 52s-5-3-5-6.5a2.8 2.8 0 0 1 5-1.5 2.8 2.8 0 0 1 5 1.5c0 3.5-5 6.5-5 6.5z' fill='${c}' opacity='.4'/>`, 60, 60)
      break
    case 'butterflies':
      image = svg(`<g transform='translate(10 10)' fill='${c}' opacity='.5'><path d='M10 10C6 2 0 0 0 6c0 4 4 6 9 5-5 2-6 8-2 9 3 1 4-4 3-8 1 4 2 9 5 8 4-1 3-7-2-9 5 1 9-1 9-5 0-6-6-4-10 4z'/></g>`, 70, 70)
      break
    case 'polka':
      image = `radial-gradient(${c} 22%, transparent 23%), radial-gradient(${c} 22%, transparent 23%)`
      size = '40px 40px'
      return { backgroundColor: s.bgColor, backgroundImage: image, backgroundSize: size, backgroundPosition: '0 0, 20px 20px' }
    case 'gingham':
      image = `linear-gradient(90deg, ${c}88 50%, transparent 50%), linear-gradient(${c}88 50%, transparent 50%)`
      size = '36px 36px'
      break
    case 'checker':
      image = `conic-gradient(${c} 25%, transparent 0 50%, ${c} 0 75%, transparent 0)`
      size = '40px 40px'
      break
    case 'stripes':
      image = `repeating-linear-gradient(90deg, ${c} 0 22px, transparent 22px 44px)`
      break
    case 'zebra':
      image = svg(`<path d='M0 10 Q30 0 60 14 T120 8 L120 18 Q90 26 60 22 T0 22Z M0 46 Q40 34 70 50 T120 44 L120 54 Q80 64 50 56 T0 58Z M0 84 Q30 74 64 88 T120 82 L120 92 Q90 100 60 96 T0 96Z' fill='${c}'/>`, 120, 110)
      break
    case 'leopard':
      image = svg(`<g fill='none' stroke='${c}' stroke-width='4' stroke-linecap='round'><path d='M10 14a7 6 0 0 1 12-2'/><path d='M26 20a6 6 0 0 1-8 6'/><path d='M50 40a7 6 0 0 1 12 1'/><path d='M64 48a6 6 0 0 1-9 5'/><path d='M60 8a5 5 0 0 1 9 2'/><path d='M16 54a6 5 0 0 1 10-1'/></g><g fill='${c}' opacity='.6'><circle cx='17' cy='18' r='3'/><circle cx='57' cy='46' r='3'/><circle cx='21' cy='57' r='2.4'/></g>`, 80, 70)
      break
    default:
      break
  }
  const base: React.CSSProperties = { backgroundColor: s.bgColor }
  const layers: string[] = []
  const sizes: string[] = []
  if (image) {
    layers.push(image)
    sizes.push(size || 'auto')
  }
  if (s.bgImage) {
    layers.push(`url("${s.bgImage}")`)
    sizes.push(s.bgImageMode === 'cover' ? 'cover' : 'auto')
  }
  if (layers.length) {
    base.backgroundImage = layers.join(', ')
    base.backgroundSize = sizes.join(', ')
    if (s.bgImage && s.bgImageMode === 'cover') base.backgroundPosition = image ? '0 0, center' : 'center'
  }
  return base
}

export function nameStyle(s: ProfileStyle, fontCss: string): React.CSSProperties {
  const base: React.CSSProperties = { fontFamily: fontCss, color: s.nameColor, lineHeight: 1.1, wordBreak: 'break-word' }
  switch (s.nameEffect) {
    case 'glitter':
      return {
        ...base,
        backgroundImage: `radial-gradient(#fff 0.8px, transparent 1.3px), radial-gradient(rgba(255,255,255,.7) 0.6px, transparent 1px), linear-gradient(100deg, ${s.nameColor}, #fff 35%, ${s.nameColor} 55%, ${s.nameColor})`,
        backgroundSize: '6px 6px, 9px 9px, 300% 100%',
        WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        filter: `drop-shadow(0 0 6px ${s.nameColor}aa)`,
        animation: 'pf-glitter 3s linear infinite',
      }
    case 'glow':
      return { ...base, textShadow: `0 0 4px #fff, 0 0 10px ${s.nameColor}, 0 0 22px ${s.nameColor}, 0 0 40px ${s.nameColor}` }
    case 'rainbow':
      return {
        ...base,
        backgroundImage: 'linear-gradient(90deg, #ff4fa3, #ffb86b, #ffe66b, #8be38b, #7cc8ff, #c9a2ff, #ff4fa3)',
        backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        animation: 'pf-rainbow 4s linear infinite',
      }
    case 'outline':
      return { ...base, WebkitTextStroke: '1.5px #2B0A2E', textShadow: '3px 3px 0 #fff, 5px 5px 0 rgba(43,10,46,.4)' }
    default:
      return base
  }
}

export function youtubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m?.[1] ?? null
}
export function spotifyEmbed(url: string) {
  const m = url.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode)\/([A-Za-z0-9]+)/)
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}` : null
}
