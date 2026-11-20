'use client'

import type React from 'react'
import { PAGE_H, PAGE_W, SPREAD_W, pageBackground, type NbElement, type NbPage } from '@/lib/notebook'
import ElementView from './ElementView'
import { StickerDefs } from './Stickers'

const RING_GAP = 34

/** Paper backgrounds + spiral binding for one spread. Children are placed in a
 *  SPREAD_W × PAGE_H layer on top, so elements can overhang the binding. */
export function SpreadFrame({
  left,
  right,
  children,
  onPageBgPointerDown,
  shadow = true,
}: {
  left?: NbPage
  right?: NbPage
  children?: React.ReactNode
  onPageBgPointerDown?: (e: React.PointerEvent, side: 0 | 1) => void
  shadow?: boolean
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
      <svg width={44} height={PAGE_H} style={{ position: 'absolute', left: PAGE_W - 22, top: 0, pointerEvents: 'none', zIndex: 0 }} aria-hidden>
        <defs>
          <linearGradient id="nb-ring" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7d8290" />
            <stop offset="0.45" stopColor="#f4f6fa" />
            <stop offset="1" stopColor="#8a8f9c" />
          </linearGradient>
        </defs>
        {Array.from({ length: rings }).map((_, r) => (
          <path key={r} d={`M4 ${32 + r * RING_GAP} C 4 ${20 + r * RING_GAP}, 40 ${20 + r * RING_GAP}, 40 ${32 + r * RING_GAP}`} fill="none" stroke="url(#nb-ring)" strokeWidth={5} strokeLinecap="round" />
        ))}
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
export default function StaticSpread({ left, right }: { left?: NbPage; right?: NbPage }) {
  return (
    <SpreadFrame left={left} right={right}>
      {sortedSpreadElements(left, right).map(({ el, page }) => (
        <div key={el.id} style={placed(el, page)}>
          <ElementView el={el} />
        </div>
      ))}
    </SpreadFrame>
  )
}
