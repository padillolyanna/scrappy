'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { SCRAPBOOK_COVERS } from '@/lib/types'
import { starterCover, PAGE_W, PAGE_H, type NbPage } from '@/lib/notebook'
import { StaticCover } from '@/components/notebook/Spread'

const SCALE = 0.32
const CARD_W = PAGE_W * SCALE + 24   // cover width + horizontal padding
const CARD_H = PAGE_H * SCALE + 60   // cover height + label area

const BLANK = { id: 'blank', name: 'Blank cover', description: 'Start from scratch and decorate it yourself' }
const TEMPLATE_OPTIONS = [
  ...SCRAPBOOK_COVERS.map((c) => ({ id: c.id, name: c.name, description: c.description })),
  BLANK,
]

let coverCache: Record<string, NbPage> | null = null
function getCovers() {
  coverCache ??= Object.fromEntries(
    TEMPLATE_OPTIONS.map((o) => [o.id, starterCover(o.id, o.id === 'blank' ? 'my scrapbook' : o.name.toLowerCase())])
  )
  return coverCache
}
const noop = () => () => {}

export default function HomepageTemplates() {
  const covers = useSyncExternalStore(noop, getCovers, () => null)

  return (
    <section style={{ padding: '0 0 clamp(32px, 5vw, 48px)' }}>
      {/* Header */}
      <div className="flex items-end justify-between mb-6 px-5" style={{ maxWidth: 1120, margin: '0 auto 24px' }}>
        <div>
          <div className="font-pixel tracking-widest" style={{ fontSize: '12px', color: 'var(--c-primary)' }} aria-hidden="true">START CREATING</div>
          <h2 className="font-pacifico text-3xl sm:text-4xl mt-1" style={{ color: 'var(--c-text)' }}>
            pick a template <span aria-hidden="true">✦</span>
          </h2>
          <p className="font-caveat text-lg mt-0.5" style={{ color: 'var(--c-text)', opacity: 0.65 }}>
            every cover is fully editable — stickers, photos, text and more
          </p>
        </div>
        <Link
          href="/scrapbook/create"
          className="flex-shrink-0"
          style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: 'var(--c-primary)', textDecoration: 'underline', marginBottom: 4 }}
        >
          VIEW ALL →
        </Link>
      </div>

      {/* Horizontal scroll row */}
      <div
        className="scrappy-scroll"
        style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 12,
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {TEMPLATE_OPTIONS.map((o) => (
          <Link
            key={o.id}
            href={`/scrapbook/create?template=${o.id}`}
            className="flex-shrink-0 flex flex-col items-center rounded-2xl bg-white/90 shadow hover:shadow-lg hover:-translate-y-1 transition-all"
            style={{
              width: CARD_W,
              minHeight: CARD_H,
              border: '2px solid rgba(58,0,48,.10)',
              padding: '12px 12px 10px',
              scrollSnapAlign: 'start',
              display: 'flex',
            }}
          >
            <div className="relative overflow-hidden" style={{ width: PAGE_W * SCALE + 6, height: PAGE_H * SCALE + 6 }}>
              <div
                className="pointer-events-none absolute left-0 top-0 origin-top-left"
                style={{ transform: `scale(${SCALE})` }}
              >
                {covers
                  ? <StaticCover page={covers[o.id]} />
                  : <div style={{ width: PAGE_W, height: PAGE_H, borderRadius: 18, background: '#f3e3ee' }} />
                }
              </div>
              {o.id === 'blank' && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="rounded-full bg-white/90 px-3 py-1 font-silkscreen text-[11px] text-[#D4006E] shadow">+ FROM SCRATCH</span>
                </div>
              )}
            </div>
            <div className="mt-2 w-full">
              <div className="font-nunito text-[14px] font-black leading-tight text-[#3A0030]">{o.name}</div>
              <div className="mt-0.5 font-nunito text-[12px] leading-snug text-[#666]">{o.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
