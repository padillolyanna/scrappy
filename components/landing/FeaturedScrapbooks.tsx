'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { SCRAPBOOK_COVERS } from '@/lib/types'

export interface LiveScrapbook {
  id: string
  title: string
  cover_id: string
  like_count: number
  view_count: number
  profiles: { username: string } | null
}

interface Props {
  scrapbooks: LiveScrapbook[]
}

const ROTATIONS = ['-2deg', '1deg', '-1deg']

function ScrapbookCard({ item, index }: { item: LiveScrapbook; index: number }) {
  const cover = SCRAPBOOK_COVERS.find((c) => c.id === item.cover_id)
  const rotate = ROTATIONS[index % ROTATIONS.length]
  const username = item.profiles?.username ?? 'anonymous'

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: index * 0.1 }}
      whileHover={{ y: -4, rotate: 0, scale: 1.02 }}
      className="polaroid relative cursor-pointer"
      style={{ transform: `rotate(${rotate})` }}
    >
      <div
        style={{ width: '100%', height: 160, position: 'relative', overflow: 'hidden', borderRadius: 2 }}
        className={`bg-gradient-to-br ${cover?.bg_gradient ?? 'from-pink-200 to-pink-100'}`}
      >
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="font-pixel text-[#3A0030]/30" style={{ fontSize: 48 }}>
            {cover?.preview_symbol ?? '✦'}
          </span>
        </div>
        {cover?.stickers.slice(0, 3).map((sticker, si) => (
          <div
            key={si}
            style={{
              position: 'absolute',
              top: si === 0 ? 8 : si === 1 ? undefined : 20,
              bottom: si === 1 ? 10 : undefined,
              right: si === 0 ? 8 : si === 2 ? 8 : undefined,
              left: si === 1 ? 12 : undefined,
              fontSize: si === 0 ? 22 : 16,
              opacity: 0.75,
            }}
          >
            {sticker}
          </div>
        ))}
      </div>

      <div style={{ padding: '4px 2px 0', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: '#3A0030', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.title || 'untitled'}
        </div>
        <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 12, color: '#FF4FA3', fontWeight: 'bold' }}>
          @{username}
        </div>
        <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 12, color: '#aaa' }}>
          ♡ {item.like_count || 0}
        </div>
      </div>
    </motion.div>
  )
}

export default function FeaturedScrapbooks({ scrapbooks }: Props) {
  if (!scrapbooks.length) return null

  return (
    <section style={{ padding: '0 20px clamp(32px, 5vw, 48px)', maxWidth: 1120, margin: '0 auto' }}>
      <div className="flex justify-between items-end mb-5">
        <div>
          <div className="font-pixel tracking-widest" style={{ fontSize: '12px', color: 'var(--c-primary)' }} aria-hidden="true">COMMUNITY</div>
          <h2 className="font-pacifico text-2xl sm:text-3xl mt-1" style={{ color: 'var(--c-text)' }}>
            scrapbooks <span aria-hidden="true">✦</span>
          </h2>
        </div>
        <Link
          href="/explore"
          style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: 'var(--c-primary)', textDecoration: 'underline' }}
        >
          VIEW ALL →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {scrapbooks.slice(0, 3).map((item, i) => (
          <Link key={item.id} href={`/scrapbook/${item.id}`}>
            <ScrapbookCard item={item} index={i} />
          </Link>
        ))}
      </div>
    </section>
  )
}
