'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { SCRAPBOOK_COVERS } from '@/lib/types'

export interface FreshScrapbook {
  id: string
  title: string
  cover_id: string
  profiles: { username: string } | null
}

interface Props {
  scrapbooks: FreshScrapbook[]
}

export default function FreshScrapbooks({ scrapbooks }: Props) {
  if (!scrapbooks.length) return null

  return (
    <section style={{ padding: '0 20px clamp(40px, 6vw, 64px)', maxWidth: 1120, margin: '0 auto' }}>
      <div className="flex justify-between items-end mb-6">
        <div>
          <div
            className="font-silkscreen tracking-widest mb-1"
            style={{ fontSize: '11px', color: 'var(--c-primary)' }}
          >
            FRESH FROM THE CLUB
          </div>
          <h2
            className="font-pacifico"
            style={{ fontSize: 'clamp(26px, 4vw, 36px)', color: 'var(--c-text)', lineHeight: 1.1 }}
          >
            just posted <span aria-hidden="true">✦</span>
          </h2>
        </div>
        <Link
          href="/explore"
          className="font-silkscreen flex-shrink-0"
          style={{ fontSize: 12, color: 'var(--c-primary)', textDecoration: 'underline' }}
        >
          VIEW ALL →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {scrapbooks.map((item, i) => {
          const cover = SCRAPBOOK_COVERS.find((c) => c.id === item.cover_id)
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 22 }}
            >
              <Link
                href={`/scrapbook/${item.id}`}
                className="block card-ink overflow-hidden hover:-translate-y-1 transition-transform"
              >
                <div
                  className={`bg-gradient-to-br ${cover?.bg_gradient ?? 'from-pink-200 to-pink-100'}`}
                  style={{ height: 140, position: 'relative' }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: 44, opacity: 0.22 }}>
                      {cover?.preview_symbol ?? '✦'}
                    </span>
                  </div>
                  {cover?.stickers.slice(0, 2).map((sticker, si) => (
                    <div
                      key={si}
                      style={{
                        position: 'absolute',
                        top: si === 0 ? 8 : undefined,
                        bottom: si === 1 ? 8 : undefined,
                        right: 8,
                        fontSize: si === 0 ? 18 : 14,
                        opacity: 0.65,
                      }}
                    >
                      {sticker}
                    </div>
                  ))}
                </div>
                <div className="p-3">
                  <div
                    className="font-nunito font-extrabold text-[13px] truncate"
                    style={{ color: 'var(--c-text)' }}
                  >
                    {item.title || 'untitled'}
                  </div>
                  <div className="font-nunito text-[12px]" style={{ color: '#E0007A' }}>
                    @{item.profiles?.username ?? 'anonymous'}
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
