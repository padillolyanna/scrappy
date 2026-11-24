'use client'

import { useSyncExternalStore } from 'react'
import { motion } from 'framer-motion'
import { SCRAPBOOK_COVERS } from '@/lib/types'
import { starterCover, PAGE_W, PAGE_H, type NbPage } from '@/lib/notebook'
import { StaticCover } from '@/components/notebook/Spread'

interface Props {
  selected: string
  onSelect: (id: string) => void
}

const SCALE = 0.32
const OPTIONS = [
  { id: 'blank', name: 'Blank cover', description: 'start from scratch and decorate it yourself' },
  ...SCRAPBOOK_COVERS.map((c) => ({ id: c.id, name: c.name, description: c.description })),
]

let coverCache: Record<string, NbPage> | null = null
function getCovers() {
  coverCache ??= Object.fromEntries(OPTIONS.map((o) => [o.id, starterCover(o.id, o.id === 'blank' ? 'my scrapbook' : o.name.toLowerCase())]))
  return coverCache
}
const noop = () => () => {}

/** Real, decorated starter covers (the same ones you get in the editor), plus a blank one. */
export default function CoverSelector({ selected, onSelect }: Props) {
  // covers use random ids/art, so build them in the browser only
  const covers = useSyncExternalStore(noop, getCovers, () => null)

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="font-pacifico text-[#3A0030] mb-2" style={{ fontFamily: 'Pacifico, cursive', fontSize: '36px' }}>
          pick your cover
        </h2>
        <p className="font-caveat text-xl text-[#666]" style={{ fontFamily: 'Caveat, cursive' }}>
          every cover is fully editable later: stickers, photos, text and spiral colour ✦
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {OPTIONS.map((o, i) => {
          const isSel = selected === o.id
          return (
            <motion.button
              key={o.id}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              whileHover={{ y: -4, rotate: i % 2 ? 0.8 : -0.8 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(o.id)}
              aria-pressed={isSel}
              className={`relative flex flex-col items-center rounded-2xl p-3 text-left transition-shadow ${
                isSel ? 'bg-[#FFE3F2] shadow-xl ring-4 ring-[#FF4FA3]/40' : 'bg-white/80 shadow hover:shadow-lg'
              }`}
              style={{ border: isSel ? '3px solid #FF4FA3' : '2px solid rgba(58,0,48,.12)' }}
            >
              <div className="relative" style={{ width: PAGE_W * SCALE + 6, height: PAGE_H * SCALE + 6 }}>
                <div className="pointer-events-none absolute left-0 top-0 origin-top-left" style={{ transform: `scale(${SCALE})` }}>
                  {covers ? <StaticCover page={covers[o.id]} /> : <div style={{ width: PAGE_W, height: PAGE_H, borderRadius: 18, background: '#f3e3ee' }} />}
                </div>
                {o.id === 'blank' && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="rounded-full bg-white/90 px-3 py-1 font-silkscreen text-[12px] text-[#D4006E] shadow">+ FROM SCRATCH</span>
                  </div>
                )}
                {isSel && (
                  <div className="absolute -top-2 -left-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#FF4FA3] text-sm font-bold text-white shadow">✓</div>
                )}
              </div>
              <div className="mt-2 w-full">
                <div className="font-nunito text-[15px] font-black leading-tight text-[#3A0030]">{o.name}</div>
                <div className="mt-0.5 font-nunito text-[13px] leading-snug text-[#666]">{o.description}</div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
