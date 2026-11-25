'use client'

import type React from 'react'
import { PAGE_H, PAGE_W, SPREAD_W, pageBackground, type NbElement, type NbPage } from '@/lib/notebook'
import ElementView from './ElementView'
import { StickerDefs } from './Stickers'

const RING_GAP = 34

// ─── coil colour helpers ──────────────────────────────────────────────────

function mix(hex: string, to: string, t: number) {
  const a = parseInt(hex.slice(1), 16), b = parseInt(to.slice(1), 16)
  const c = (sh: number) => Math.round(((a >> sh) & 255) * (1 - t) + ((b >> sh) & 255) * t)
  return `rgb(${c(16)}, ${c(8)}, ${c(0)})`
}

function CoilDefs({ id, color }: { id: string; color: string }) {
  return (
    <defs>
      {/* front of the wire: subtle tube shading, same colour family as the back */}
      <linearGradient id={`${id}-front`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={mix(color, '#000000', 0.2)} />
        <stop offset="0.28" stopColor={mix(color, '#ffffff', 0.22)} />
        <stop offset="0.55" stopColor={color} />
        <stop offset="1" stopColor={mix(color, '#000000', 0.3)} />
      </linearGradient>
      {/* back of the wire, seen through the hole: darker */}
      <linearGradient id={`${id}-back`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={mix(color, '#000000', 0.6)} />
        <stop offset="1" stopColor={mix(color, '#000000', 0.3)} />
      </linearGradient>
      <filter id={`${id}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="2.5" dy="3" stdDeviation="1.8" floodColor="#2B0A2E" floodOpacity="0.35" />
      </filter>
    </defs>
  )
}

export const DEFAULT_SPIRAL = '#B9C0CC'

/** Paper backgrounds + spiral binding for one spread. Children are placed in a
 *  SPREAD_W × PAGE_H layer on top, so elements can overhang the binding. */
export function SpreadFrame({
  left,
  right,
  children,
  onPageBgPointerDown,
  shadow = true,
  spiral = DEFAULT_SPIRAL,
}: {
  left?: NbPage
  right?: NbPage
  children?: React.ReactNode
  onPageBgPointerDown?: (e: React.PointerEvent, side: 0 | 1) => void
  shadow?: boolean
  spiral?: string
}) {
  const rings = Math.floor((PAGE_H - 40) / RING_GAP)
  return (
    <div style={{ position: 'relative', width: SPREAD_W, height: PAGE_H }}>
      <StickerDefs />
      {/* stacked page edges */}
      {shadow && (
        <>
          <div style={{ position: 'absolute', inset: '6px -6px -8px -6px', background: '#f3e9ef', borderRadius: 14, border: '2px solid #2B0A2E', boxShadow: '6px 10px 0 rgba(43,10,46,.18)' }} />
          <div style={{ position: 'absolute', inset: '3px -3px -4px -3px', background: '#fbf4f8', borderRadius: 12, border: '1.5px solid rgba(43,10,46,.35)' }} />
        </>
      )}
      {[left, right].map((pg, i) => (
        <div
          key={i}
          onPointerDown={onPageBgPointerDown ? (e) => onPageBgPointerDown(e, i as 0 | 1) : undefined}
          style={{
            position: 'absolute', top: 0, left: i * PAGE_W, width: PAGE_W, height: PAGE_H,
            ...(pg ? pageBackground(pg) : { background: '#f4eef2' }),
            borderRadius: i === 0 ? '12px 0 0 12px' : '0 12px 12px 0',
            border: '2px solid #2B0A2E',
            borderLeftWidth: i === 1 ? 0 : 2,
            borderRightWidth: i === 0 ? 0 : 2,
            boxShadow: i === 0 ? 'inset -18px 0 24px -16px rgba(43,10,46,.28)' : 'inset 18px 0 24px -16px rgba(43,10,46,.28)',
            overflow: 'hidden',
          }}
        >
          {/* punched holes */}
          {Array.from({ length: rings }).map((_, r) => (
            <div key={r} style={{ position: 'absolute', top: 28 + r * RING_GAP, [i === 0 ? 'right' : 'left']: 8, width: 9, height: 9, borderRadius: '50%', background: '#6b5a66', boxShadow: 'inset 1px 1px 2px rgba(0,0,0,.5)' }} />
          ))}
          {!pg && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Caveat', cursive", fontSize: 26, color: '#B08AA8' }}>the end ♡</div>
          )}
        </div>
      ))}
      {children && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>{children}</div>}
      {/* spiral rings (drawn above paper, below nothing interactive) */}
      <svg width={48} height={PAGE_H} style={{ position: 'absolute', left: PAGE_W - 24, top: 0, pointerEvents: 'none', zIndex: 0, overflow: 'visible' }} aria-hidden>
        <CoilDefs id="nb-ring" color={spiral} />
        {Array.from({ length: rings }).map((_, r) => {
          const y = 32 + r * RING_GAP
          return (
            <g key={r} filter="url(#nb-ring-shadow)">
              <path d={`M6 ${y + 1} C 6 ${y + 8}, 42 ${y + 8}, 42 ${y + 1}`} fill="none" stroke="url(#nb-ring-back)" strokeWidth={4} strokeLinecap="round" opacity={0.85} />
              <path d={`M6 ${y} C 6 ${y - 13}, 42 ${y - 13}, 42 ${y}`} fill="none" stroke="url(#nb-ring-front)" strokeWidth={5.5} strokeLinecap="round" />
              <path d={`M11 ${y - 5} C 15 ${y - 10}, 24 ${y - 11}, 30 ${y - 9}`} fill="none" stroke="rgba(255,255,255,.8)" strokeWidth={1.4} strokeLinecap="round" />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function placed(el: NbElement, pageIndex: number): React.CSSProperties {
  return {
    position: 'absolute',
    left: pageIndex * PAGE_W + el.x,
    top: el.y,
    width: el.w,
    height: el.h,
    transform: `rotate(${el.rotation}deg)${el.props.flipX ? ' scaleX(-1)' : ''}`,
    opacity: el.props.opacity ?? 1,
    filter: el.props.shadow ? 'drop-shadow(4px 7px 6px rgba(43,10,46,.4))' : undefined,
  }
}

export function sortedSpreadElements(left?: NbPage, right?: NbPage) {
  const all: { el: NbElement; page: 0 | 1 }[] = []
  left?.elements.forEach((el) => all.push({ el, page: 0 }))
  right?.elements.forEach((el) => all.push({ el, page: 1 }))
  return all.sort((a, b) => a.el.z - b.el.z || a.page - b.page)
}

/** Read-only spread. */
export default function StaticSpread({ left, right, spiral }: { left?: NbPage; right?: NbPage; spiral?: string }) {
  return (
    <SpreadFrame left={left} right={right} spiral={spiral}>
      {sortedSpreadElements(left, right).map(({ el, page }) => (
        <div key={el.id} style={placed(el, page)}>
          <ElementView el={el} />
        </div>
      ))}
    </SpreadFrame>
  )
}

// ─── Front cover (closed notebook) ────────────────────────────────────────

/** A single closed notebook cover with ring binding on the left edge.
 *  Children are placed in a PAGE_W × PAGE_H layer, like a spread page. */
export function CoverFrame({
  page,
  children,
  onPageBgPointerDown,
}: {
  page: NbPage
  children?: React.ReactNode
  onPageBgPointerDown?: (e: React.PointerEvent) => void
}) {
  const rings = Math.floor((PAGE_H - 40) / RING_GAP)
  return (
    <div style={{ position: 'relative', width: PAGE_W, height: PAGE_H }}>
      <StickerDefs />
      {/* page block peeking out on the right/bottom */}
      <div style={{ position: 'absolute', inset: '8px -8px -9px 10px', background: '#fbf6f9', borderRadius: '6px 16px 16px 6px', border: '2px solid #2B0A2E', boxShadow: '6px 10px 0 rgba(43,10,46,.2)' }} />
      <div style={{ position: 'absolute', inset: '4px -4px -5px 8px', background: '#fff', borderRadius: '6px 14px 14px 6px', border: '1.5px solid rgba(43,10,46,.35)', backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 3px, rgba(43,10,46,.06) 3px 4px)' }} />
      {/* the cover board */}
      <div
        onPointerDown={onPageBgPointerDown}
        style={{
          position: 'absolute', inset: 0,
          ...pageBackground(page),
          borderRadius: '8px 18px 18px 8px',
          border: '2.5px solid #2B0A2E',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 0 3px rgba(255,255,255,.35), inset -10px 0 18px rgba(0,0,0,.08)',
        }}
      >
        {/* laminated gloss */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,.35) 0%, rgba(255,255,255,0) 28%, rgba(255,255,255,0) 62%, rgba(255,255,255,.18) 70%, rgba(255,255,255,0) 78%)', pointerEvents: 'none' }} />
        {/* punched holes */}
        {Array.from({ length: rings }).map((_, r) => (
          <div key={r} style={{ position: 'absolute', top: 28 + r * RING_GAP, left: 14, width: 9, height: 9, borderRadius: '50%', background: '#6b5a66', boxShadow: 'inset 1px 1px 2px rgba(0,0,0,.5)' }} />
        ))}
      </div>
      {children && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>{children}</div>}
      {/* ring binding: same D-ring style as the spread interior, centred on the left edge */}
      <svg width={48} height={PAGE_H} style={{ position: 'absolute', left: -24, top: 0, pointerEvents: 'none', overflow: 'visible' }} aria-hidden>
        <CoilDefs id="nb-coil" color={page.spiral ?? DEFAULT_SPIRAL} />
        {Array.from({ length: rings }).map((_, r) => {
          const y = 32 + r * RING_GAP
          return (
            <g key={r} filter="url(#nb-coil-shadow)">
              <path d={`M6 ${y + 1} C 6 ${y + 8}, 42 ${y + 8}, 42 ${y + 1}`} fill="none" stroke="url(#nb-coil-back)" strokeWidth={4} strokeLinecap="round" opacity={0.85} />
              <path d={`M6 ${y} C 6 ${y - 13}, 42 ${y - 13}, 42 ${y}`} fill="none" stroke="url(#nb-coil-front)" strokeWidth={5.5} strokeLinecap="round" />
              <path d={`M11 ${y - 5} C 15 ${y - 10}, 24 ${y - 11}, 30 ${y - 9}`} fill="none" stroke="rgba(255,255,255,.8)" strokeWidth={1.4} strokeLinecap="round" />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function StaticCover({ page }: { page: NbPage }) {
  return (
    <CoverFrame page={page}>
      {[...page.elements].sort((a, b) => a.z - b.z).map((el) => (
        <div key={el.id} style={placed(el, 0)}>
          <ElementView el={el} />
        </div>
      ))}
    </CoverFrame>
  )
}
