'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { SCRAPBOOK_COVERS } from '@/lib/types'
import { starterCover, PAGE_W, PAGE_H, type NbPage } from '@/lib/notebook'
import { StaticCover } from '@/components/notebook/Spread'

const SCALE = 0.32

const TEMPLATE_OPTIONS = SCRAPBOOK_COVERS.map((c) => ({
  id: c.id,
  name: c.name,
  description: c.description,
}))

let coverCache: Record<string, NbPage> | null = null
function getCovers() {
  coverCache ??= Object.fromEntries(
    TEMPLATE_OPTIONS.map((o) => [o.id, starterCover(o.id, o.name.toLowerCase())])
  )
  return coverCache
}
const noop = () => () => {}

export default function HomepageTemplates() {
  const covers = useSyncExternalStore(noop, getCovers, () => null)

  return (
    <section style={{ padding: '0 20px clamp(32px, 5vw, 48px)', maxWidth: 1120, margin: '0 auto' }}>
      <div className="text-center mb-8">
        <div className="font-pixel tracking-widest" style={{ fontSize: '12px', color: 'var(--c-primary)' }} aria-hidden="true">START CREATING</div>
        <h2 className="font-pacifico text-3xl sm:text-4xl mt-1" style={{ color: 'var(--c-text)' }}>
          pick a template <span aria-hidden="true">✦</span>
        </h2>
        <p className="font-caveat text-lg mt-1" style={{ color: 'var(--c-text)', opacity: 0.7 }}>
          every cover is fully editable — stickers, photos, text and more
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 mb-6">
        {TEMPLATE_OPTIONS.map((o, i) => (
          <motion.div
            key={o.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            whileHover={{ y: -4, rotate: i % 2 ? 0.8 : -0.8 }}
          >
            <Link
              href={`/scrapbook/create?template=${o.id}`}
              className="flex flex-col items-center rounded-2xl p-3 w-full bg-white/90 shadow hover:shadow-lg transition-shadow"
              style={{ border: '2px solid rgba(58,0,48,.10)', display: 'flex' }}
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
              </div>
              <div className="mt-2 w-full">
                <div className="font-nunito text-[15px] font-black leading-tight text-[#3A0030]">{o.name}</div>
                <div className="mt-0.5 font-nunito text-[13px] leading-snug text-[#666]">{o.description}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/scrapbook/create"
          style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: 'var(--c-primary)', textDecoration: 'underline' }}
        >
          or create from scratch →
        </Link>
      </div>
    </section>
  )
}
