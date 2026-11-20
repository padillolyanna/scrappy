'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { SCRAPBOOK_COVERS } from '@/lib/types'

interface ScrapbookItem {
  id: string
  title: string
  cover_id: string
  like_count: number
  created_at: string
  profiles: { username: string } | null
  badge?: string
  badgeBg?: string
}

interface Props {
  scrapbooks?: ScrapbookItem[]
}

const BADGE_CONFIGS = [
  { badge: 'FEATURED', bg: '#FF4FA3' },
  { badge: 'MOST CREATIVE', bg: '#7C4DDB' },
  { badge: 'MOST NOSTALGIC', bg: '#FF6B00' },
]

const ROTATIONS = ['-2deg', '1deg', '-1deg']

function AwardRibbon({ label, bg }: { label: string; bg: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: -8,
        right: -8,
        background: bg,
        color: 'white',
        fontFamily: "'Chango', 'Arial Black', sans-serif",
        fontSize: 9,
        padding: '3px 8px',
        border: '2px solid #2B0A2E',
        borderRadius: 4,
        boxShadow: '1px 1px 0 #2B0A2E',
        lineHeight: 1.2,
        zIndex: 5,
        transform: 'rotate(4deg)',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
  )
}

function ScrapbookCard({ item, index }: { item: ScrapbookItem; index: number }) {
  const cover = SCRAPBOOK_COVERS.find((c) => c.id === item.cover_id)
  const { badge, bg: badgeBg } = BADGE_CONFIGS[index % BADGE_CONFIGS.length]
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
      <AwardRibbon label={badge} bg={badgeBg} />

      {/* Photo area */}
      <div
        style={{
          width: '100%',
          height: 160,
          background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
        }}
        className={`bg-gradient-to-br ${cover?.bg_gradient ?? 'from-pink-200 to-pink-100'}`}
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
          <span
            className="font-pixel text-[#3A0030]/30"
            style={{ fontSize: 48 }}
          >
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

      {/* Polaroid caption */}
      <div style={{ padding: '4px 2px 0', textAlign: 'center' }}>
        <div
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 15,
            color: '#3A0030',
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.title || 'untitled'}
        </div>
        <div
          style={{
            fontFamily: 'Verdana, sans-serif',
            fontSize: 10,
            color: '#FF4FA3',
            fontWeight: 'bold',
          }}
        >
          @{username}
        </div>
        <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 9, color: '#aaa' }}>
          ♡ {item.like_count || 0}
        </div>
      </div>
    </motion.div>
  )
}

// Fallback placeholder cards when no real data exists
const PLACEHOLDER: ScrapbookItem[] = [
  { id: 'placeholder-1', title: 'Pink Princess Diary', cover_id: 'pink-princess', like_count: 0, created_at: '', profiles: { username: 'butterflymphie' } },
  { id: 'placeholder-2', title: 'Cyber Dreams', cover_id: 'cyber-y2k', like_count: 0, created_at: '', profiles: { username: 'neonlilacdream' } },
  { id: 'placeholder-3', title: 'Memories from 2003', cover_id: 'retro-camera', like_count: 0, created_at: '', profiles: { username: 'retrodaydream' } },
]

export default function FeaturedScrapbooks({ scrapbooks }: Props) {
  const items = scrapbooks && scrapbooks.length > 0 ? scrapbooks.slice(0, 3) : PLACEHOLDER
  const isPlaceholder = !scrapbooks || scrapbooks.length === 0

  return (
    <section style={{ padding: '20px 20px' }}>
      <div className="panel-header" style={{ marginBottom: 0 }}>
        today&apos;s picks ✦
      </div>
      <div className="widget-box" style={{ padding: '16px' }}>
        <div className="flex justify-between items-center mb-4">
          <span
            style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: '#888' }}
          >
            {isPlaceholder
              ? 'featured scrapbooks — coming soon'
              : 'featured scrapbooks — voted by the community'}
          </span>
          <Link
            href="/explore"
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: 14,
              color: '#FF4FA3',
              textDecoration: 'underline',
            }}
          >
            VIEW ALL →
          </Link>
        </div>

        <span
          aria-hidden="true"
          className="absolute top-2 right-10 text-xl pointer-events-none select-none"
          style={{ color: '#C9A2FF' }}
        >
          ✿
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {items.map((item, i) =>
            isPlaceholder ? (
              <div key={item.id}>
                <ScrapbookCard item={item} index={i} />
              </div>
            ) : (
              <Link key={item.id} href={`/scrapbook/${item.id}`}>
                <ScrapbookCard item={item} index={i} />
              </Link>
            )
          )}
        </div>
      </div>
    </section>
  )
}
