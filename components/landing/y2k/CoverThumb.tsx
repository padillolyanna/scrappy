'use client'

import { useSyncExternalStore } from 'react'
import { starterCover, PAGE_W, PAGE_H, type NbPage } from '@/lib/notebook'
import { StaticCover } from '@/components/notebook/Spread'

// starter covers use random ids, so build them in the browser only (cached per cover+title)
const cache = new Map<string, NbPage>()
const noop = () => () => {}

/** A small, real notebook cover (same art as the editor's starter covers). */
export default function CoverThumb({ coverId, title, scale = 0.22 }: { coverId: string; title: string; scale?: number }) {
  const key = `${coverId}|${title}`
  const page = useSyncExternalStore(
    noop,
    () => {
      let p = cache.get(key)
      if (!p) { p = starterCover(coverId, title); cache.set(key, p) }
      return p
    },
    () => null,
  )
  const w = Math.round(PAGE_W * scale)
  const h = Math.round(PAGE_H * scale)
  return (
    <div style={{ width: w, height: h, overflow: 'hidden' }} aria-hidden="true">
      {page ? (
        <div className="pointer-events-none origin-top-left" style={{ transform: `scale(${scale})` }}>
          <StaticCover page={page} />
        </div>
      ) : (
        <div style={{ width: w, height: h, background: '#F3DDEB' }} />
      )}
    </div>
  )
}
