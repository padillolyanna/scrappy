'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const FEATURED = [
  {
    id: '1',
    title: 'My Pink Princess Diary',
    author: 'butterflymphie',
    badge: 'FEATURED',
    badgeBg: '#FF4FA3',
    rotate: '-2deg',
    strips: ['#FFB6D9', '#C9A2FF', '#FFF0A8'],
    stickers: ['♡', '✦', '🌸'],
    stickerPos: [{ top: 8, right: 8 }, { bottom: 10, left: 12 }, { top: 20, left: 40 }],
    washibg: '#FFF0A8',
    photoBg: 'linear-gradient(135deg, #FFB6D9, #E8D6FF)',
  },
  {
    id: '2',
    title: 'Cyber Dreams',
    author: 'neonlilacdream',
    badge: 'MOST CREATIVE',
    badgeBg: '#7C4DDB',
    rotate: '1deg',
    strips: ['#A8DFFF', '#6FE3FF', '#C9A2FF'],
    stickers: ['◎', '★', '💿'],
    stickerPos: [{ top: 6, right: 10 }, { bottom: 12, right: 8 }, { top: 22, left: 10 }],
    washibg: '#A8DFFF',
    photoBg: 'linear-gradient(135deg, #A8DFFF, #C9A2FF)',
  },
  {
    id: '3',
    title: 'Memories from 2003',
    author: 'retrodaydream',
    badge: 'MOST NOSTALGIC',
    badgeBg: '#FF6B00',
    rotate: '-1deg',
    strips: ['#FFF0A8', '#FFD6EC', '#B6FFD9'],
    stickers: ['★', '✿', '◆'],
    stickerPos: [{ top: 6, left: 8 }, { bottom: 8, right: 12 }, { top: 24, right: 36 }],
    washibg: '#FFF0A8',
    photoBg: 'linear-gradient(135deg, #FFF0A8, #FFD6EC)',
  },
]

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

function PolaroidCard({ s, i }: { s: typeof FEATURED[0]; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.1 }}
      whileHover={{ y: -4, rotate: 0, scale: 1.02 }}
      className="polaroid relative cursor-pointer"
      style={{ transform: `rotate(${s.rotate})` }}
    >
      {/* Award ribbon */}
      <AwardRibbon label={s.badge} bg={s.badgeBg} />

      {/* Photo area — CSS collage */}
      <div
        style={{
          width: '100%',
          height: 160,
          background: s.photoBg,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
        }}
      >
        {/* Colored paper strips */}
        {s.strips.map((color, si) => (
          <div
            key={si}
            style={{
              position: 'absolute',
              height: 14,
              left: `${si * 28}%`,
              right: `${(2 - si) * 15}%`,
              top: `${si * 28 + 10}%`,
              background: color,
              opacity: 0.65,
              transform: `rotate(${si % 2 === 0 ? '-5deg' : '4deg'})`,
            }}
          />
        ))}

        {/* Washi tape strip */}
        <div style={{
          position: 'absolute',
          top: 10, left: -6, right: -6,
          height: 11,
          background: s.washibg,
          opacity: 0.55,
          transform: 'rotate(-2deg)',
        }} />

        {/* Small "photo" placeholder */}
        <div style={{
          position: 'absolute',
          top: 30, left: 10,
          width: 50, height: 40,
          background: 'rgba(255,255,255,0.35)',
          border: '1px solid rgba(255,255,255,0.6)',
          borderRadius: 2,
        }} />

        {/* Sticker emoji/symbols */}
        {s.stickers.map((stk, si) => (
          <div
            key={si}
            style={{
              position: 'absolute',
              top: s.stickerPos[si].top,
              left: (s.stickerPos[si] as { left?: number }).left,
              right: (s.stickerPos[si] as { right?: number }).right,
              fontSize: si === 0 ? 22 : si === 1 ? 16 : 14,
              lineHeight: 1,
              opacity: 0.85,
              pointerEvents: 'none',
            }}
          >
            {stk}
          </div>
        ))}
      </div>

      {/* Polaroid caption */}
      <div style={{ padding: '4px 2px 0', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: '#3A0030', fontWeight: 600 }}>
          {s.title}
        </div>
        <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 10, color: '#FF4FA3', fontWeight: 'bold' }}>
          @{s.author}
        </div>
      </div>
    </motion.div>
  )
}

export default function FeaturedScrapbooks() {
  return (
    <section style={{ padding: '20px 20px' }}>
      {/* Panel header */}
      <div className="panel-header" style={{ marginBottom: 0 }}>
        today&apos;s picks ✦
      </div>
      <div className="widget-box" style={{ padding: '16px' }}>
        <div className="flex justify-between items-center mb-4">
          <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: '#888' }}>
            featured scrapbooks — voted by the community
          </span>
          <Link
            href="/explore"
            style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: '#FF4FA3', textDecoration: 'underline' }}
          >
            VIEW ALL →
          </Link>
        </div>

        {/* Sticker decoration */}
        <span aria-hidden="true" className="absolute top-2 right-10 text-xl pointer-events-none select-none" style={{ color: '#C9A2FF' }}>✿</span>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {FEATURED.map((s, i) => (
            <Link key={s.id} href={`/scrapbook/${s.id}`}>
              <PolaroidCard s={s} i={i} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
