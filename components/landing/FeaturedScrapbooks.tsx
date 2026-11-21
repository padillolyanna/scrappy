'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { SCRAPBOOK_COVERS } from '@/lib/types'
import { DEMO_SCRAPBOOKS, SHOW_DEMO } from '@/lib/demoContent'

export interface LiveScrapbook {
  id: string
  title: string
  cover_id: string
  like_count: number
  view_count: number
  profiles: { username: string } | null
}

interface Props {
  scrapbooks?: LiveScrapbook[]
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
        top: -8, right: -8,
        background: bg,
        color: 'white',
        fontFamily: "'Chango', 'Arial Black', sans-serif",
        fontSize: 12,
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

function DemoRibbon() {
  return (
    <div
      style={{
        position: 'absolute',
        top: -8, right: -8,
        background: '#888',
        color: 'white',
        fontFamily: "'Chango', 'Arial Black', sans-serif",
        fontSize: 12,
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
      BY SCRAPPY TEAM
    </div>
  )
}

function ScrapbookCard({ item, index, isDemo }: { item: LiveScrapbook; index: number; isDemo: boolean }) {
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
      style={{ transform: `rotate(${rotate})`, opacity: isDemo ? 0.75 : 1 }}
    >
      {isDemo ? <DemoRibbon /> : <AwardRibbon label={badge} bg={badgeBg} />}

      <div
        style={{
          width: '100%',
          height: 160,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
        }}
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
        <div style={{
          fontFamily: "'Caveat', cursive",
          fontSize: 15,
          color: '#3A0030',
          fontWeight: 600,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
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
  const hasReal = scrapbooks && scrapbooks.length > 0
  const isDemo = !hasReal && SHOW_DEMO
  const items: LiveScrapbook[] = hasReal
    ? scrapbooks.slice(0, 3)
    : DEMO_SCRAPBOOKS.map((d) => ({
        id: d.id,
        title: d.title,
        cover_id: d.cover_id,
        like_count: d.like_count,
        view_count: d.view_count,
        profiles: d.profiles,
      }))

  return (
    <section style={{ padding: '20px 20px' }}>
      <div className="panel-header" style={{ marginBottom: 0 }}>
        today&apos;s picks ✦
      </div>
      <div className="widget-box" style={{ padding: '16px' }}>
        <div className="flex justify-between items-center mb-4">
          <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: '#888' }}>
            {isDemo ? 'featured scrapbooks — coming soon' : 'featured scrapbooks — voted by the community'}
          </span>
          <Link href="/explore" style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: '#FF4FA3', textDecoration: 'underline' }}>
            VIEW ALL →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {items.map((item, i) =>
            isDemo ? (
              <Link key={item.id} href="/explore">
                <ScrapbookCard item={item} index={i} isDemo />
              </Link>
            ) : (
              <Link key={item.id} href={`/scrapbook/${item.id}`}>
                <ScrapbookCard item={item} index={i} isDemo={false} />
              </Link>
            )
          )}
        </div>
      </div>
    </section>
  )
}
