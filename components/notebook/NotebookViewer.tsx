'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PAGE_H, PAGE_W, SPREAD_W, type NbPage } from '@/lib/notebook'
import StaticSpread from './Spread'

/** Flip-through, read-only notebook. Shows full spreads on wide screens and one
 *  page at a time on phones. */
export default function NotebookViewer({ pages }: { pages: NbPage[] }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [spread, setSpread] = useState(0)
  const [side, setSide] = useState<0 | 1>(0)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const single = width > 0 && width < 600
  const spreads = Math.max(1, Math.ceil(pages.length / 2))
  const viewW = single ? PAGE_W : SPREAD_W
  const scale = width ? Math.min(1, (width - 16) / (viewW + 16)) : 0

  const total = single ? spreads * 2 : spreads
  const pos = single ? spread * 2 + side : spread
  function go(d: number) {
    const n = Math.min(total - 1, Math.max(0, pos + d))
    if (single) {
      setSpread(Math.floor(n / 2))
      setSide((n % 2) as 0 | 1)
    } else setSpread(n)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div ref={boxRef} className="w-full select-none">
      <div className="relative mx-auto" style={{ width: (viewW + 16) * scale, height: (PAGE_H + 20) * scale }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${spread}-${single ? side : 'x'}`}
            initial={{ opacity: 0, rotateY: -12, x: 20 }}
            animate={{ opacity: 1, rotateY: 0, x: 0 }}
            exit={{ opacity: 0, rotateY: 12, x: -20 }}
            transition={{ duration: 0.28, ease: [0.2, 0.9, 0.3, 1.2] }}
            style={{ position: 'absolute', left: 8 * scale, top: 4 * scale, width: viewW * scale, height: (PAGE_H + 12) * scale, overflow: single ? 'hidden' : 'visible' }}
          >
            {scale > 0 && (
              <div style={{ width: viewW, height: PAGE_H, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
                <div style={{ transform: single ? `translateX(${-side * PAGE_W}px)` : undefined }}>
                  <StaticSpread left={pages[spread * 2]} right={pages[spread * 2 + 1]} />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-4 mt-4">
        <button onClick={() => go(-1)} disabled={pos === 0} className="btn-bevel text-xs px-4 py-2 disabled:opacity-40" aria-label="previous page">
          ◀ prev
        </button>
        <span className="font-silkscreen text-xs text-[#2B0A2E]">
          {single ? `page ${pos + 1} / ${total}` : `spread ${pos + 1} / ${total}`}
        </span>
        <button onClick={() => go(1)} disabled={pos >= total - 1} className="btn-bevel text-xs px-4 py-2 disabled:opacity-40" aria-label="next page">
          next ▶
        </button>
      </div>
    </div>
  )
}
