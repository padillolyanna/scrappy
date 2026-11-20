// Notebook scrapbook model — a Canva-style free-form canvas laid out as
// notebook spreads (left page + right page joined by a spiral binding).
// All coordinates are in logical page units; the canvas is scaled to fit.

import type React from 'react'
import { TEMPLATES, SCRAPBOOK_COVERS } from '@/lib/types'
import { BACKGROUNDS as ART_BACKGROUNDS } from '@/lib/photoboothArt'

export const PAGE_W = 480
export const PAGE_H = 640
export const SPREAD_W = PAGE_W * 2

export type ElementType = 'text' | 'image' | 'sticker' | 'tape' | 'shape' | 'question'

export interface ElementProps {
  // text + question
  font?: string
  size?: number
  color?: string
  align?: 'left' | 'center' | 'right'
  bold?: boolean
  italic?: boolean
  textBg?: 'none' | 'highlight' | 'label' | 'sticky' | 'bubble'
  bgColor?: string
  // image
  frame?: 'none' | 'polaroid' | 'film' | 'rounded' | 'circle' | 'stamp' | 'heart'
  caption?: string
  filter?: 'none' | 'vintage' | 'bw' | 'rosy' | 'dreamy'
  // tape
  pattern?: string
  // shape
  shape?: 'rect' | 'circle' | 'heart' | 'star' | 'speech' | 'ticket' | 'scallop' | 'cloud'
  fill?: string
  stroke?: string
  // question
  question?: string
  cardStyle?: 'card' | 'lined' | 'sticky'
  // text effects
  textFx?: 'none' | 'outline' | 'shadow' | 'glitter' | 'chrome' | 'gradient' | 'sticker'
  gradTo?: string
  letterSpacing?: number
  // image: Higgsfield/asset frame id (see lib/assetLibrary)
  assetFrame?: string
  // common
  shadow?: boolean
  opacity?: number
  locked?: boolean
  flipX?: boolean
}

export interface NbElement {
  id: string
  type: ElementType
  x: number
  y: number
  w: number
  h: number
  rotation: number
  z: number
  content: string
  props: ElementProps
}

export interface NbPage {
  id: string
  /** the notebook's front cover — always pages[0] when present, shown closed and on its own */
  cover?: boolean
  /** cover only: colour of the plastic coil (used for the whole notebook) */
  spiral?: string
  /** a PaperId, or 'art:<backgroundId>' for a drawn texture from lib/photoboothArt */
  paper: PaperId | `art:${string}`
  color: string
  /** optional uploaded background photo, drawn over the paper */
  bgImage?: string
  /** background photo zoom, 0.5–3 (1 = cover) */
  bgScale?: number
  elements: NbElement[]
}

// ─── Paper ────────────────────────────────────────────────────────────────

export type PaperId = 'plain' | 'lined' | 'grid' | 'dots' | 'gingham' | 'stripes' | 'stars' | 'kraft'

export const PAPERS: { id: PaperId; label: string }[] = [
  { id: 'plain', label: 'plain' },
  { id: 'lined', label: 'lined' },
  { id: 'grid', label: 'grid' },
  { id: 'dots', label: 'dots' },
  { id: 'gingham', label: 'gingham' },
  { id: 'stripes', label: 'stripes' },
  { id: 'stars', label: 'stars' },
  { id: 'kraft', label: 'kraft' },
]

export const PAPER_COLORS = [
  '#FFFFFF', '#FFF8ED', '#FFE4F0', '#FFD1E8', '#EDE4FF', '#E4F4FF', '#E6F8E8', '#FFF6D6', '#F4E3CC', '#2B0A2E',
]

const artCache = new Map<string, string>()
/** Draw a photobooth texture once into a data URL (browser only). */
function artTexture(id: string): string | null {
  if (typeof document === 'undefined') return null
  const hit = artCache.get(id)
  if (hit) return hit
  const def = ART_BACKGROUNDS.find((b) => b.id === id)
  if (!def) return null
  const c = document.createElement('canvas')
  c.width = PAGE_W
  c.height = PAGE_H
  const ctx = c.getContext('2d')
  if (!ctx) return null
  def.draw(ctx, PAGE_W, PAGE_H, 1)
  const url = c.toDataURL('image/jpeg', 0.9)
  artCache.set(id, url)
  return url
}

export function pageBackground(page: Pick<NbPage, 'paper' | 'color' | 'bgImage' | 'bgScale'>): React.CSSProperties {
  const base = page.paper.startsWith('art:')
    ? (() => {
        const url = artTexture(page.paper.slice(4))
        return url ? { backgroundColor: page.color, backgroundImage: `url("${url}")`, backgroundSize: 'cover' } : { backgroundColor: page.color }
      })()
    : paperStyle(page.paper as PaperId, page.color)
  if (!page.bgImage) return base
  const zoom = Math.round((page.bgScale ?? 1) * 100)
  return {
    ...base,
    backgroundImage: `url("${page.bgImage.replace(/"/g, '%22')}")${base.backgroundImage ? `, ${base.backgroundImage}` : ''}`,
    backgroundSize: `${zoom === 100 ? 'cover' : `${zoom}%`}${base.backgroundImage ? `, ${base.backgroundSize ?? 'auto'}` : ''}`,
    backgroundPosition: 'center',
    backgroundRepeat: zoom < 100 ? 'repeat' : 'no-repeat',
  }
}

/** bg_texture column encoding: "[cover~]<paper>" or "[cover~]<paper>|img|<scale>|<url>" */
export function encodePaper(p: NbPage) {
  const base = p.bgImage ? `${p.paper}|img|${p.bgScale ?? 1}|${p.bgImage}` : p.paper
  if (!p.cover) return base
  return p.spiral ? `cover:${p.spiral}~${base}` : `cover~${base}`
}
export function decodePaper(raw: string | null): Pick<NbPage, 'paper' | 'bgImage' | 'bgScale' | 'cover' | 'spiral'> {
  if (!raw) return { paper: 'plain' }
  const m = raw.match(/^cover(?::(#[0-9a-fA-F]{6}))?~/)
  const body = m ? raw.slice(m[0].length) : raw
  const [paper, kind, scale, ...rest] = body.split('|')
  const extra = m ? { cover: true as const, ...(m[1] ? { spiral: m[1] } : {}) } : {}
  if (kind === 'img' && rest.length) return { paper: paper as NbPage['paper'], bgScale: Number(scale) || 1, bgImage: rest.join('|'), ...extra }
  return { paper: paper as NbPage['paper'], ...extra }
}

export function paperStyle(paper: PaperId, color: string): React.CSSProperties {
  const ink = 'rgba(43,10,46,0.10)'
  const pink = 'rgba(255,79,163,0.22)'
  switch (paper) {
    case 'lined':
      return {
        backgroundColor: color,
        backgroundImage: `linear-gradient(90deg, transparent 47px, ${pink} 47px, ${pink} 49px, transparent 49px), repeating-linear-gradient(0deg, transparent 0 27px, ${ink} 27px 28px)`,
      }
    case 'grid':
      return {
        backgroundColor: color,
        backgroundImage: `linear-gradient(${ink} 1px, transparent 1px), linear-gradient(90deg, ${ink} 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
      }
    case 'dots':
      return {
        backgroundColor: color,
        backgroundImage: `radial-gradient(${ink.replace('0.10', '0.22')} 1.3px, transparent 1.4px)`,
        backgroundSize: '18px 18px',
      }
    case 'gingham':
      return {
        backgroundColor: color,
        backgroundImage: `linear-gradient(90deg, ${pink} 50%, transparent 50%), linear-gradient(${pink} 50%, transparent 50%)`,
        backgroundSize: '32px 32px',
      }
    case 'stripes':
      return {
        backgroundColor: color,
        backgroundImage: `repeating-linear-gradient(90deg, ${pink} 0 18px, transparent 18px 36px)`,
      }
    case 'stars':
      return {
        backgroundColor: color,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Cpath d='M14 6l2.4 5.6 6 .5-4.6 3.9 1.4 5.9L14 18.8 8.8 21.9l1.4-5.9-4.6-3.9 6-.5z' fill='%23FF4FA3' opacity='.18'/%3E%3Cpath d='M42 34l1.6 3.7 4 .3-3 2.6.9 3.9L42 42.4l-3.5 2.1.9-3.9-3-2.6 4-.3z' fill='%23C9A2FF' opacity='.3'/%3E%3C/svg%3E")`,
      }
    case 'kraft':
      return {
        backgroundColor: '#D9B98C',
        backgroundImage: `radial-gradient(rgba(90,60,20,0.12) 1px, transparent 1.5px), radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1.5px)`,
        backgroundSize: '7px 7px, 11px 11px',
        backgroundPosition: '0 0, 3px 5px',
      }
    default:
      return { backgroundColor: color }
  }
}

// ─── Fonts, colors, tapes ─────────────────────────────────────────────────

export const FONTS: { id: string; label: string; css: string }[] = [
  { id: 'chango', label: 'Bubble', css: "'Chango', 'Arial Black', sans-serif" },
  { id: 'pacifico', label: 'Retro Script', css: "'Pacifico', cursive" },
  { id: 'caveat', label: 'Handwriting', css: "'Caveat', cursive" },
  { id: 'gochi', label: 'Doodle', css: "'Gochi Hand', cursive" },
  { id: 'nunito', label: 'Rounded', css: "'Nunito', sans-serif" },
  { id: 'fredoka', label: 'Soft', css: "'Fredoka', sans-serif" },
  { id: 'cherry', label: 'Cherry Bomb', css: "'Cherry Bomb One', cursive" },
  { id: 'elite', label: 'Typewriter', css: "'Special Elite', monospace" },
  { id: 'vt323', label: 'Pixel', css: "'VT323', monospace" },
  { id: 'silkscreen', label: 'Pixel Bold', css: "'Silkscreen', monospace" },
  { id: 'verdana', label: 'Verdana', css: 'Verdana, Tahoma, sans-serif' },
]

export function fontCss(id?: string) {
  return FONTS.find((f) => f.id === id)?.css ?? FONTS[2].css
}

export const SWATCHES = [
  '#2B0A2E', '#FFFFFF', '#FF4FA3', '#D4006E', '#FF9ECF', '#C9A2FF', '#7C4DDB', '#6FE3FF', '#3B82F6', '#7ED957', '#FFD84F', '#FF9B6A', '#8B5A2B', '#9CA3AF',
]

export const TAPES: { id: string; label: string; css: (c: string) => React.CSSProperties }[] = [
  { id: 'solid', label: 'solid', css: (c) => ({ background: c }) },
  {
    id: 'grid',
    label: 'grid',
    css: (c) => ({
      backgroundColor: c,
      backgroundImage: 'linear-gradient(rgba(255,255,255,.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.55) 1px, transparent 1px)',
      backgroundSize: '8px 8px',
    }),
  },
  {
    id: 'stripes',
    label: 'stripes',
    css: (c) => ({ backgroundColor: c, backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,.5) 0 5px, transparent 5px 10px)' }),
  },
  {
    id: 'dots',
    label: 'dots',
    css: (c) => ({ backgroundColor: c, backgroundImage: 'radial-gradient(rgba(255,255,255,.75) 2px, transparent 2.5px)', backgroundSize: '10px 10px' }),
  },
  {
    id: 'gingham',
    label: 'gingham',
    css: (c) => ({
      backgroundColor: c,
      backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,.45) 50%, transparent 50%), linear-gradient(rgba(255,255,255,.45) 50%, transparent 50%)',
      backgroundSize: '12px 12px',
    }),
  },
  {
    id: 'hearts',
    label: 'hearts',
    css: (c) => ({
      backgroundColor: c,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18'%3E%3Cpath d='M9 15s-6-3.7-6-7.7A3.3 3.3 0 0 1 9 5.6a3.3 3.3 0 0 1 6 1.7c0 4-6 7.7-6 7.7z' fill='white' opacity='.7'/%3E%3C/svg%3E")`,
      backgroundSize: '18px 18px',
    }),
  },
  {
    id: 'glitter',
    label: 'glitter',
    css: (c) => ({
      backgroundColor: c,
      backgroundImage:
        'radial-gradient(rgba(255,255,255,.95) 0.8px, transparent 1.2px), radial-gradient(rgba(255,255,255,.6) 0.7px, transparent 1.1px), linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,.45) 45%, rgba(255,255,255,0) 70%)',
      backgroundSize: '5px 5px, 7px 7px, 100% 100%',
      backgroundPosition: '0 0, 2px 3px, 0 0',
    }),
  },
]

export const TAPE_COLORS = ['#FFB6D9', '#FF9ECF', '#C9E7B0', '#C9B6FF', '#A8DFFF', '#FFF0A8', '#FFD1B3', '#E6E6E6']

// ─── Element factories ────────────────────────────────────────────────────

export function uid(prefix = 'el') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function nextZ(page: NbPage) {
  return page.elements.reduce((m, e) => Math.max(m, e.z), 0) + 1
}

type NewEl = Omit<NbElement, 'id' | 'z'>

export function makeText(preset: 'heading' | 'subheading' | 'note' | 'pixel' | 'sticky' | 'label', x = 120, y = 120): NewEl {
  const base = { type: 'text' as const, x, y, rotation: 0 }
  switch (preset) {
    case 'heading':
      return { ...base, w: 300, h: 60, content: 'my little life', props: { font: 'chango', size: 34, color: '#FF4FA3', align: 'center' } }
    case 'subheading':
      return { ...base, w: 260, h: 40, content: 'summer 2004 ✦', props: { font: 'pacifico', size: 24, color: '#2B0A2E', align: 'center' } }
    case 'pixel':
      return { ...base, w: 220, h: 30, content: '> loading memories...', props: { font: 'vt323', size: 22, color: '#7C4DDB', align: 'left' } }
    case 'sticky':
      return { ...base, w: 170, h: 150, rotation: -3, content: 'note to self:\ndon\'t forget ♡', props: { font: 'caveat', size: 24, color: '#2B0A2E', align: 'left', textBg: 'sticky', bgColor: '#FFF0A8' } }
    case 'label':
      return { ...base, w: 200, h: 34, content: 'best day ever', props: { font: 'gochi', size: 20, color: '#2B0A2E', align: 'center', textBg: 'label', bgColor: '#FFE4F0' } }
    default:
      return { ...base, w: 260, h: 80, content: 'write something sweet here…', props: { font: 'caveat', size: 24, color: '#2B0A2E', align: 'left' } }
  }
}

export function makeImage(src = '', frame: ElementProps['frame'] = 'polaroid', x = 110, y = 140): NewEl {
  const dims = frame === 'polaroid' ? { w: 220, h: 260 } : frame === 'film' ? { w: 260, h: 200 } : { w: 220, h: 220 }
  return { type: 'image', x, y, ...dims, rotation: frame === 'polaroid' ? -3 : 0, content: src, props: { frame, caption: frame === 'polaroid' ? 'xoxo' : '', filter: 'none' } }
}

export function makeSticker(content: string, x = 180, y = 220): NewEl {
  return { type: 'sticker', x, y, w: 90, h: 90, rotation: 0, content, props: {} }
}

export function makeTape(pattern = 'grid', color = '#FFB6D9', x = 150, y = 100): NewEl {
  return { type: 'tape', x, y, w: 150, h: 34, rotation: -8, content: '', props: { pattern, color } }
}

export function makeShape(shape: NonNullable<ElementProps['shape']>, x = 140, y = 180): NewEl {
  const wide = shape === 'speech' || shape === 'ticket' || shape === 'cloud'
  return {
    type: 'shape', x, y, w: wide ? 220 : 150, h: wide ? 130 : 150, rotation: 0, content: '',
    props: { shape, fill: shape === 'heart' ? '#FF9ECF' : shape === 'star' ? '#FFD84F' : '#FFFFFF', stroke: '#2B0A2E' },
  }
}

export function makeQuestion(question: string, answer = '', x = 40, y = 60, style: ElementProps['cardStyle'] = 'card'): NewEl {
  return {
    type: 'question', x, y, w: 400, h: 110, rotation: 0, content: answer,
    props: { question, cardStyle: style, font: 'caveat', size: 22, color: '#2B0A2E', bgColor: style === 'sticky' ? '#FFF0A8' : '#FFFFFF' },
  }
}

export function addTo(page: NbPage, el: NewEl): { page: NbPage; id: string } {
  const id = uid()
  return { page: { ...page, elements: [...page.elements, { ...el, id, z: nextZ(page) }] }, id }
}

export function blankPage(color = '#FFF8ED', paper: NbPage['paper'] = 'grid'): NbPage {
  return { id: uid('pg'), paper, color, elements: [] }
}

// ─── Starter layout from cover + template ─────────────────────────────────

const COVER_PAPER: Record<string, { color: string; paper: PaperId; alt: PaperId; accent: string; tape: string }> = {
  'pink-princess': { color: '#FFE4F0', paper: 'gingham', alt: 'lined', accent: '#FF4FA3', tape: '#FFB6D9' },
  'cyber-y2k': { color: '#E4F4FF', paper: 'grid', alt: 'dots', accent: '#7C4DDB', tape: '#A8DFFF' },
  'digital-diary': { color: '#FFF8ED', paper: 'lined', alt: 'grid', accent: '#FF4FA3', tape: '#FFF0A8' },
  'indie-sleaze': { color: '#2B0A2E', paper: 'dots', alt: 'plain', accent: '#FFF0A8', tape: '#E6E6E6' },
  'sweet-memories': { color: '#FFF6D6', paper: 'dots', alt: 'lined', accent: '#FF9B6A', tape: '#FFD1B3' },
  'blue-dream': { color: '#E4F4FF', paper: 'stars', alt: 'lined', accent: '#6B9FFF', tape: '#C9B6FF' },
  'retro-camera': { color: '#F4E3CC', paper: 'kraft', alt: 'grid', accent: '#8B5A2B', tape: '#FFF0A8' },
  'glitter-explosion': { color: '#FFD1E8', paper: 'stars', alt: 'gingham', accent: '#D4006E', tape: '#FF9ECF' },
}

export function coverTheme(coverId: string) {
  return COVER_PAPER[coverId] ?? COVER_PAPER['pink-princess']
}

export const SPIRAL_COLORS: { id: string; label: string; hex: string }[] = [
  { id: 'grape', label: 'grape', hex: '#8A5CFF' },
  { id: 'bubblegum', label: 'bubblegum', hex: '#FF5FB1' },
  { id: 'sky', label: 'sky blue', hex: '#3B9BFF' },
  { id: 'aqua', label: 'aqua', hex: '#20D3C2' },
  { id: 'lime', label: 'lime', hex: '#8EE03A' },
  { id: 'sunny', label: 'sunny', hex: '#FFC93C' },
  { id: 'chrome', label: 'chrome', hex: '#B9C0CC' },
  { id: 'gold', label: 'gold', hex: '#D4A437' },
  { id: 'clear', label: 'clear', hex: '#EAF2FF' },
  { id: 'black', label: 'black', hex: '#2A2730' },
]

const COVER_ART: Record<string, { bg: string; ink: string; accent: string; spiral: string }> = {
  'pink-princess': { bg: 'art:glitter-pink', ink: '#3B3BB8', accent: '#FFFFFF', spiral: '#8A5CFF' },
  'cyber-y2k': { bg: 'art:starburst-blue', ink: '#FFFFFF', accent: '#FF4FA3', spiral: '#B9C0CC' },
  'digital-diary': { bg: 'art:hearts', ink: '#3B3BB8', accent: '#FF2E93', spiral: '#FF5FB1' },
  'indie-sleaze': { bg: 'art:zebra', ink: '#FF2E93', accent: '#111111', spiral: '#2A2730' },
  'sweet-memories': { bg: 'art:daisies', ink: '#3B3BB8', accent: '#FF9B6A', spiral: '#FFC93C' },
  'blue-dream': { bg: 'art:clouds', ink: '#3B3BB8', accent: '#FFFFFF', spiral: '#3B9BFF' },
  'retro-camera': { bg: 'art:leopard', ink: '#2B1408', accent: '#FF5FA2', spiral: '#D4A437' },
  'glitter-explosion': { bg: 'art:glitter-night', ink: '#FFD1E8', accent: '#FF4FA3', spiral: '#20D3C2' },
}

/** A decorated front cover: glitter texture, heart photo window, title and doodles. */
export function starterCover(coverId: string, title: string): NbPage {
  if (coverId === 'blank') {
    // start from scratch: a plain board with just the title
    const blank: NbPage = { id: uid('pg'), cover: true, paper: 'plain', color: '#FFD1E8', spiral: '#B9C0CC', elements: [] }
    return addTo(blank, {
      type: 'text', x: 40, y: 80, w: 400, h: 60, rotation: 0, content: title || 'my scrapbook',
      props: { font: 'pacifico', size: 40, color: '#3A0030', align: 'center' },
    }).page
  }
  const art = COVER_ART[coverId] ?? COVER_ART['pink-princess']
  let cover: NbPage = { id: uid('pg'), cover: true, paper: art.bg as NbPage['paper'], color: '#FF9ECF', spiral: art.spiral, elements: [] }
  const doodle = (content: string, x: number, y: number, rotation: number, size = 22, font = 'gochi') =>
    ({ type: 'text' as const, x, y, w: 200, h: 34, rotation, content, props: { font, size, color: art.ink, align: 'center' as const } })
  cover = addTo(cover, {
    type: 'text', x: 40, y: 52, w: 400, h: 70, rotation: -4, content: title || 'my scrapbook',
    props: { font: 'pacifico', size: 46, color: art.accent, align: 'center', textFx: 'outline' },
  }).page
  cover = addTo(cover, { ...makeImage('', 'heart', 115, 190), w: 250, h: 230, rotation: 0, props: { frame: 'heart', caption: '', filter: 'none', shadow: true } }).page
  cover = addTo(cover, doodle('keep out!! ✦', 20, 140, -12)).page
  cover = addTo(cover, doodle('xoxo', 330, 150, 10, 26)).page
  cover = addTo(cover, doodle('dear diary…', 30, 450, 8, 24, 'caveat')).page
  cover = addTo(cover, doodle('best. year. ever!!!', 250, 470, -8, 22)).page
  cover = addTo(cover, doodle('don\'t read this', 120, 560, -3, 26, 'caveat')).page
  cover = addTo(cover, { ...makeSticker('svg:heart', 50, 220), w: 64, h: 64, rotation: -14, props: { color: '#FF4FA3' } }).page
  cover = addTo(cover, { ...makeSticker('svg:butterfly', 370, 360), w: 70, h: 70, rotation: 12, props: { color: '#C9A2FF' } }).page
  cover = addTo(cover, { ...makeSticker('svg:sparkle', 395, 40), w: 46, h: 46, props: { color: '#FFFFFF' } }).page
  cover = addTo(cover, { ...makeSticker('svg:gem-heart', 360, 570), w: 52, h: 52, rotation: 10, props: { color: '#FF5FB1' } }).page
  return cover
}

export function starterPages(coverId: string, templateId: string, title: string): NbPage[] {
  if (coverId === 'blank') {
    return [starterCover('blank', title), blankPage('#FFFFFF', 'grid'), blankPage('#FFFFFF', 'grid')]
  }
  return [starterCover(coverId, title), ...starterInner(coverId, templateId, title)]
}

function starterInner(coverId: string, templateId: string, title: string): NbPage[] {
  const theme = coverTheme(coverId)
  const cover = SCRAPBOOK_COVERS.find((c) => c.id === coverId)
  const template = TEMPLATES.find((t) => t.id === templateId)
  const questions = template?.questions ?? []
  const dark = theme.color === '#2B0A2E'
  const ink = dark ? '#FFF8ED' : '#2B0A2E'

  let left = blankPage(theme.color, theme.paper)
  let right = blankPage(theme.color, theme.alt)

  // Left: title page collage
  left = addTo(left, { ...makeText('heading', 60, 52), w: 360, content: title || cover?.name.toLowerCase() || 'my scrapbook', props: { font: 'chango', size: 34, color: theme.accent, align: 'center' } }).page
  left = addTo(left, { ...makeText('subheading', 110, 112), content: template?.name.toLowerCase() ?? 'all about me', props: { font: 'pacifico', size: 22, color: ink, align: 'center' } }).page
  left = addTo(left, { ...makeImage('', 'polaroid', 70, 180), rotation: -5 }).page
  left = addTo(left, { ...makeImage('', 'polaroid', 230, 300), rotation: 4, props: { frame: 'polaroid', caption: 'besties ♡', filter: 'none' } }).page
  left = addTo(left, makeTape('grid', theme.tape, 120, 168)).page
  left = addTo(left, { ...makeTape('stripes', theme.tape, 290, 288), rotation: 10 }).page
  left = addTo(left, { ...makeSticker('svg:star', 330, 170), props: { color: '#FFD84F' } }).page
  left = addTo(left, { ...makeSticker('svg:heart', 40, 470), w: 70, h: 70, props: { color: theme.accent } }).page
  left = addTo(left, { ...makeSticker('svg:sparkle', 400, 560), w: 50, h: 50, props: { color: theme.accent } }).page

  // Right: first questions, as a letter-like page
  const first = questions.slice(0, 4)
  first.forEach((q, i) => {
    right = addTo(right, { ...makeQuestion(q.question_text, '', 40, 60 + i * 130, i % 2 ? 'lined' : 'card'), rotation: i % 2 ? 1 : -1, props: { question: q.question_text, cardStyle: i % 2 ? 'lined' : 'card', font: 'caveat', size: 22, color: '#2B0A2E', bgColor: '#FFFFFF' } }).page
  })
  right = addTo(right, { ...makeSticker('svg:clover', 395, 20), w: 64, h: 64, props: { color: '#9BE07A' } }).page
  right = addTo(right, { ...makeSticker('svg:clip', 190, -26), w: 100, h: 70, props: {} }).page

  const pages = [left, right]

  // Remaining questions on extra spreads
  const rest = questions.slice(4)
  for (let i = 0; i < rest.length; i += 8) {
    let l = blankPage(theme.color, theme.alt)
    let r = blankPage(theme.color, theme.paper)
    rest.slice(i, i + 4).forEach((q, j) => {
      l = addTo(l, makeQuestion(q.question_text, '', 40, 60 + j * 130, j % 2 ? 'sticky' : 'card')).page
    })
    rest.slice(i + 4, i + 8).forEach((q, j) => {
      r = addTo(r, makeQuestion(q.question_text, '', 40, 60 + j * 130, j % 2 ? 'card' : 'lined')).page
    })
    if (r.elements.length === 0) {
      r = addTo(r, { ...makeImage('', 'film', 110, 200) }).page
      r = addTo(r, { ...makeText('note', 110, 430), content: 'more memories go here ✦' }).page
    }
    pages.push(l, r)
  }
  return pages
}

// ─── DB mapping (scrapbook_pages / scrapbook_elements) ────────────────────

export interface ElementRow {
  page_id: string
  type: 'text' | 'image' | 'sticker' | 'question' | 'decoration'
  content: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  font_family: string | null
  font_size: number | null
  color: string | null
  z_index: number
  props: Record<string, unknown>
}

export function elementToRow(el: NbElement, pageId: string): ElementRow {
  const dbType = el.type === 'tape' || el.type === 'shape' ? 'decoration' : el.type
  return {
    page_id: pageId,
    type: dbType,
    content: el.content,
    x: el.x,
    y: el.y,
    width: el.w,
    height: el.h,
    rotation: el.rotation,
    font_family: el.props.font ?? null,
    font_size: el.props.size ? Math.round(el.props.size) : null,
    color: el.props.color ?? null,
    z_index: el.z,
    props: { ...el.props, kind: el.type, v: 2 },
  }
}

export function rowToElement(row: {
  id: string; type: string; content: string; x: number; y: number; width: number; height: number
  rotation: number; z_index: number; props?: Record<string, unknown> | null
}): NbElement | null {
  const p = (row.props ?? {}) as ElementProps & { kind?: ElementType; v?: number }
  if (p.v !== 2) return null
  const { kind, v: _v, ...props } = p
  void _v
  return {
    id: row.id,
    type: kind ?? (row.type as ElementType),
    x: row.x, y: row.y, w: row.width, h: row.height,
    rotation: row.rotation ?? 0, z: row.z_index ?? 0,
    content: row.content ?? '',
    props,
  }
}

export function questionAnswers(pages: NbPage[]) {
  return pages
    .flatMap((p) => p.elements)
    .filter((e) => e.type === 'question' && e.props.question && e.content.trim())
    .map((e) => ({ question_text: e.props.question as string, answer_text: e.content.trim() }))
}

// ─── Images ───────────────────────────────────────────────────────────────

export function compressImage(file: File, maxSide = 1400, quality = 0.84): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('bad image'))
      img.onload = () => {
        const s = Math.min(1, maxSide / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * s)
        canvas.height = Math.round(img.height * s)
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('no canvas'))
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const keepAlpha = file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/gif'
        const type = keepAlpha ? 'image/png' : 'image/jpeg'
        resolve(canvas.toDataURL(type, quality))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

export function dataUrlToBlob(dataUrl: string) {
  const [head, body] = dataUrl.split(',')
  const mime = head.match(/data:(.*?);/)?.[1] ?? 'image/jpeg'
  const bin = atob(body)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

export const IMAGE_FILTERS: Record<string, string> = {
  none: 'none',
  vintage: 'sepia(.45) contrast(1.05) saturate(1.2) brightness(1.03)',
  bw: 'grayscale(1) contrast(1.1)',
  rosy: 'sepia(.2) saturate(1.4) hue-rotate(-12deg) brightness(1.05)',
  dreamy: 'brightness(1.1) saturate(1.3) contrast(.92) blur(.3px)',
}

/** True when an image has any transparent pixels (sampled). */
export function hasTransparency(dataUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onerror = () => resolve(false)
    img.onload = () => {
      const w = Math.min(160, img.width), h = Math.max(1, Math.round((img.height / img.width) * w))
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')
      if (!ctx) return resolve(false)
      ctx.drawImage(img, 0, 0, w, h)
      const d = ctx.getImageData(0, 0, w, h).data
      for (let i = 3; i < d.length; i += 4) if (d[i] < 250) return resolve(true)
      resolve(false)
    }
    img.src = dataUrl
  })
}
