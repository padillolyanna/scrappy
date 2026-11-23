'use client'

import { pageBackground, PAGE_W, PAGE_H, type NbPage } from '@/lib/notebook'
import ElementView from './ElementView'

/** Renders a real scrapbook page scaled down to fit the given display dimensions. */
export default function PageThumbnail({
  page,
  displayWidth = 240,
  displayHeight = 160,
}: {
  page: NbPage
  displayWidth?: number
  displayHeight?: number
}) {
  // Scale to fill width, then clip height from the top
  const scale = displayWidth / PAGE_W
  const scaledH = PAGE_H * scale

  return (
    <div
      style={{
        width: displayWidth,
        height: displayHeight,
        overflow: 'hidden',
        position: 'relative',
        background: page.color || '#FFF8ED',
      }}
    >
      <div
        style={{
          width: PAGE_W,
          height: PAGE_H,
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          ...pageBackground(page),
        }}
      >
        {page.elements.map((el) => (
          <div
            key={el.id}
            style={{
              position: 'absolute',
              left: el.x,
              top: el.y,
              width: el.w,
              height: el.h,
              transform: `rotate(${el.rotation}deg)`,
              opacity: el.props.opacity ?? 1,
            }}
          >
            <ElementView el={el} />
          </div>
        ))}
      </div>
      {/* subtle vignette so edges blend into card */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `linear-gradient(to bottom, transparent ${displayHeight * 0.6}px, rgba(255,255,255,0.4) 100%)`,
        }}
      />
    </div>
  )
}
