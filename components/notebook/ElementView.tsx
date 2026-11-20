'use client'

import type React from 'react'
import { fontCss, IMAGE_FILTERS, TAPES, type NbElement } from '@/lib/notebook'
import { Sticker } from './Stickers'
import { assetFull, findFrameAsset } from '@/lib/assetLibrary'

const OUT = '#2B0A2E'

const SHAPE_PATHS: Record<string, string> = {
  heart: 'M50 92C28 76 4 60 4 36 4 20 16 8 31 8c9 0 15 5 19 11 4-6 10-11 19-11 15 0 27 12 27 28 0 24-24 40-46 56z',
  star: 'M50 4l13.5 29 31.5 3.5-23.5 21.5 6.5 31.5L50 73.5 22 89.5l6.5-31.5L5 36.5 36.5 33z',
  speech: 'M10 6h80a6 6 0 0 1 6 6v54a6 6 0 0 1-6 6H40L22 94l4-22H10a6 6 0 0 1-6-6V12a6 6 0 0 1 6-6z',
  ticket: 'M4 10h92v24a8 8 0 0 0 0 16 8 8 0 0 0 0 16v24H4V66a8 8 0 0 0 0-16 8 8 0 0 0 0-16z',
  cloud: 'M24 88C12 88 4 79 4 68c0-10 7-18 16-19 1-17 15-31 31-31 13 0 24 8 29 19 1 0 2 0 3 0 11 0 17 9 17 20v7c0 13-9 24-22 24z',
  scallop:
    'M50 4c6 0 9 6 14 7s11-3 15 1 1 10 4 15 9 7 9 13-6 9-7 14 3 11-1 15-10 1-15 4-7 9-13 9-9-6-14-7-11 3-15-1-1-10-4-15-9-7-9-13 6-9 7-14-3-11 1-15 10-1 15-4 7-9 13-9z',
}

export function ShapeView({ el }: { el: NbElement }) {
  const { shape = 'rect', fill = '#fff', stroke = OUT } = el.props
  if (shape === 'rect' || shape === 'circle') {
    return (
      <div
        style={{
          width: '100%', height: '100%', background: fill, border: `3px solid ${stroke}`,
          borderRadius: shape === 'circle' ? '50%' : 10, boxShadow: '3px 4px 0 rgba(43,10,46,.18)',
        }}
      />
    )
  }
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%" style={{ overflow: 'visible', filter: 'drop-shadow(3px 4px 0 rgba(43,10,46,.18))' }}>
      <path d={SHAPE_PATHS[shape]} fill={fill} stroke={stroke} strokeWidth={3} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  )
}

export function TapeView({ el }: { el: NbElement }) {
  const tape = TAPES.find((t) => t.id === el.props.pattern) ?? TAPES[1]
  return (
    <div
      style={{
        width: '100%', height: '100%', opacity: 0.86,
        ...tape.css(el.props.color ?? '#FFB6D9'),
        clipPath:
          'polygon(0 6%, 3% 0, 6% 8%, 9% 0, 91% 0, 94% 8%, 97% 0, 100% 6%, 100% 94%, 97% 100%, 94% 92%, 91% 100%, 9% 100%, 6% 92%, 3% 100%, 0 94%)',
        boxShadow: 'inset 0 0 0 100px rgba(255,255,255,.04)',
      }}
    />
  )
}

export function textBoxStyle(el: NbElement): React.CSSProperties {
  const p = el.props
  const base: React.CSSProperties = {
    fontFamily: fontCss(p.font),
    fontSize: p.size ?? 24,
    color: p.color ?? OUT,
    textAlign: p.align ?? 'left',
    fontWeight: p.bold ? 800 : p.font === 'chango' ? 400 : 500,
    fontStyle: p.italic ? 'italic' : 'normal',
    lineHeight: 1.25,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    width: '100%',
    minHeight: '100%',
  }
  if (p.font === 'chango' && !p.textFx) {
    Object.assign(base, { WebkitTextStroke: '1px #2B0A2E', textShadow: '2px 2px 0 #fff, 3px 3px 0 rgba(43,10,46,.35)' })
  }
  if (p.letterSpacing) base.letterSpacing = `${p.letterSpacing}px`
  const c = p.color ?? OUT
  switch (p.textFx) {
    case 'outline':
      Object.assign(base, { WebkitTextStroke: `${Math.max(1, (p.size ?? 24) / 18)}px #2B0A2E`, paintOrder: 'stroke fill', textShadow: '2px 2px 0 #fff' })
      break
    case 'shadow':
      Object.assign(base, { textShadow: `3px 3px 0 #2B0A2E, 5px 5px 0 ${p.gradTo ?? '#FFD84F'}` })
      break
    case 'sticker':
      Object.assign(base, { textShadow: '0 0 0 #fff, -3px -3px 0 #fff, 3px -3px 0 #fff, -3px 3px 0 #fff, 3px 3px 0 #fff, 0 3px 0 #fff, 0 -3px 0 #fff, 3px 0 0 #fff, -3px 0 0 #fff, 4px 6px 6px rgba(43,10,46,.35)' })
      break
    case 'gradient':
      Object.assign(base, { backgroundImage: `linear-gradient(180deg, ${c}, ${p.gradTo ?? '#6FE3FF'})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(2px 2px 0 rgba(43,10,46,.35))' })
      break
    case 'glitter':
      Object.assign(base, {
        backgroundImage: `radial-gradient(#fff 0.9px, transparent 1.3px), radial-gradient(rgba(255,255,255,.7) 0.6px, transparent 1px), linear-gradient(100deg, ${c}, ${p.gradTo ?? '#FFD1E8'} 45%, ${c})`,
        backgroundSize: '5px 5px, 8px 8px, 100% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        filter: `drop-shadow(0 0 1px #2B0A2E) drop-shadow(0 0 5px ${c})`,
      })
      break
    case 'chrome':
      Object.assign(base, {
        backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #c7ccd6 38%, #6d7383 50%, #e8ebf1 62%, #9aa0ae 100%)',
        WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextStroke: '1px #2B0A2E',
        filter: `drop-shadow(2px 3px 0 ${p.gradTo ?? '#FF4FA3'})`,
      })
      break
  }
  switch (p.textBg) {
    case 'highlight':
      return { ...base, background: `linear-gradient(transparent 45%, ${p.bgColor ?? '#FFF0A8'} 45%, ${p.bgColor ?? '#FFF0A8'} 90%, transparent 90%)`, padding: '0 4px' }
    case 'label':
      return { ...base, background: p.bgColor ?? '#FFE4F0', border: `2px solid ${OUT}`, borderRadius: 6, padding: '2px 10px', boxShadow: '2px 2px 0 rgba(43,10,46,.25)' }
    case 'sticky':
      return { ...base, background: p.bgColor ?? '#FFF0A8', padding: '14px 14px 10px', boxShadow: '2px 6px 10px rgba(43,10,46,.18)', backgroundImage: 'linear-gradient(rgba(0,0,0,.05) 0 18px, transparent 18px)' }
    case 'bubble':
      return { ...base, background: p.bgColor ?? '#FFFFFF', border: `2.5px solid ${OUT}`, borderRadius: 18, padding: '10px 14px', boxShadow: '3px 3px 0 rgba(43,10,46,.25)' }
    default:
      return base
  }
}

export function ImageView({ el, onPickPhoto }: { el: NbElement; onPickPhoto?: () => void }) {
  const { frame = 'none', caption, filter = 'none' } = el.props
  const img = el.content ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={el.content} alt={caption || 'scrapbook photo'} draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: IMAGE_FILTERS[filter], display: 'block' }} />
  ) : (
    <div
      onDoubleClick={onPickPhoto}
      style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'repeating-linear-gradient(45deg, #FFE4F0 0 10px, #FFF0F7 10px 20px)', color: '#D4006E', fontFamily: "'VT323', monospace", fontSize: 18, textAlign: 'center', gap: 2,
      }}
    >
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#D4006E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
      {onPickPhoto ? 'double-click to add photo' : ''}
    </div>
  )

  const asset = el.props.assetFrame ? findFrameAsset(el.props.assetFrame) : undefined
  if (asset) {
    const w = asset.window
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <div style={{ position: 'absolute', left: `${w.x}%`, top: `${w.y}%`, width: `${w.w}%`, height: `${w.h}%`, overflow: 'hidden' }}>{img}</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={assetFull(asset.id)} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill', pointerEvents: 'none' }} />
      </div>
    )
  }

  switch (frame) {
    case 'polaroid':
      return (
        <div style={{ width: '100%', height: '100%', background: '#fff', padding: '7% 7% 0', boxShadow: '2px 5px 12px rgba(43,10,46,.25)', display: 'flex', flexDirection: 'column', border: '1px solid #eee' }}>
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>{img}</div>
          <div style={{ height: '22%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Caveat', cursive", fontSize: Math.max(14, el.w / 11), color: OUT, overflow: 'hidden' }}>{caption}</div>
        </div>
      )
    case 'film':
      return (
        <div style={{ width: '100%', height: '100%', background: '#1b1b1f', padding: '9% 4%', boxShadow: '2px 5px 12px rgba(43,10,46,.3)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: '2% 2% auto', height: '4%', backgroundImage: 'repeating-linear-gradient(90deg, #f4f4f4 0 8px, transparent 8px 16px)', opacity: 0.9 }} />
          <div style={{ position: 'absolute', inset: 'auto 2% 2%', height: '4%', backgroundImage: 'repeating-linear-gradient(90deg, #f4f4f4 0 8px, transparent 8px 16px)', opacity: 0.9 }} />
          <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>{img}</div>
        </div>
      )
    case 'rounded':
      return <div style={{ width: '100%', height: '100%', borderRadius: 18, overflow: 'hidden', border: '4px solid #fff', boxShadow: '0 0 0 2.5px #2B0A2E, 3px 5px 0 2px rgba(43,10,46,.2)' }}>{img}</div>
    case 'circle':
      return <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '5px solid #fff', boxShadow: '0 0 0 2.5px #2B0A2E, 3px 5px 0 2px rgba(43,10,46,.2)' }}>{img}</div>
    case 'heart':
      return (
        <div style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 0 #fff) drop-shadow(3px 4px 0 rgba(43,10,46,.2))' }}>
          <div style={{ width: '100%', height: '100%', WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath d='${encodeURIComponent(SHAPE_PATHS.heart)}'/%3E%3C/svg%3E")`, maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath d='${encodeURIComponent(SHAPE_PATHS.heart)}'/%3E%3C/svg%3E")`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }}>{img}</div>
        </div>
      )
    case 'stamp':
      return (
        <div style={{ width: '100%', height: '100%', background: '#fff', padding: '8%', boxShadow: '2px 4px 8px rgba(43,10,46,.25)', WebkitMaskImage: 'radial-gradient(circle at 6px 6px, transparent 4.5px, #000 5px)', maskImage: 'radial-gradient(circle at 6px 6px, transparent 4.5px, #000 5px)', WebkitMaskSize: '12px 12px', maskSize: '12px 12px', WebkitMaskPosition: '-6px -6px', maskPosition: '-6px -6px' }}>
          <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>{img}</div>
        </div>
      )
    default:
      return <div style={{ width: '100%', height: '100%', overflow: 'hidden', boxShadow: '2px 4px 8px rgba(43,10,46,.2)' }}>{img}</div>
  }
}

export function QuestionView({ el, answerSlot }: { el: NbElement; answerSlot?: React.ReactNode }) {
  const p = el.props
  const style = p.cardStyle ?? 'card'
  const wrap: React.CSSProperties =
    style === 'sticky'
      ? { background: p.bgColor ?? '#FFF0A8', boxShadow: '2px 6px 10px rgba(43,10,46,.18)', padding: '10px 14px' }
      : style === 'lined'
      ? { background: 'repeating-linear-gradient(0deg, transparent 0 25px, rgba(255,79,163,.28) 25px 26px), #fff', borderLeft: '4px solid #FF9ECF', padding: '8px 14px', boxShadow: '2px 3px 0 rgba(43,10,46,.12)' }
      : { background: p.bgColor ?? '#fff', border: '2.5px solid #2B0A2E', borderRadius: 10, padding: '10px 14px', boxShadow: '3px 3px 0 #FF9ECF' }
  return (
    <div style={{ width: '100%', minHeight: '100%', ...wrap }}>
      <div style={{ fontFamily: "'Silkscreen', monospace", fontSize: 12, color: '#D4006E', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>{p.question}</div>
      {answerSlot ?? (
        <div style={{ fontFamily: fontCss(p.font), fontSize: p.size ?? 22, color: el.content ? p.color ?? OUT : '#B08AA8', lineHeight: 1.25, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {el.content || '…'}
        </div>
      )}
    </div>
  )
}

/** Static render of one element's content (no position/rotation). */
export default function ElementView({ el, onPickPhoto }: { el: NbElement; onPickPhoto?: () => void }) {
  switch (el.type) {
    case 'text':
      return <div style={textBoxStyle(el)}>{el.content}</div>
    case 'image':
      return <ImageView el={el} onPickPhoto={onPickPhoto} />
    case 'sticker':
      return <Sticker content={el.content} color={el.props.color} />
    case 'tape':
      return <TapeView el={el} />
    case 'shape':
      return <ShapeView el={el} />
    case 'question':
      return <QuestionView el={el} />
    default:
      return null
  }
}
