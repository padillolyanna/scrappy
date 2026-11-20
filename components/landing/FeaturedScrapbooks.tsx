'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const FEATURED = [
  {
    id: '1',
    title: 'My Pink Princess Diary',
    author: 'butterflymphie',
    likes: 284,
    views: '1.2k',
    badge: 'FEATURED',
    bg: 'from-pink-200 via-pink-100 to-purple-100',
    symbol: '♡',
    rotate: '-2deg',
  },
  {
    id: '2',
    title: 'Cyber Dreams',
    author: 'neonlilacdream',
    likes: 198,
    views: '876',
    badge: 'MOST CREATIVE',
    bg: 'from-blue-200 via-cyan-100 to-teal-100',
    symbol: '◎',
    rotate: '1deg',
  },
  {
    id: '3',
    title: 'Memories from 2003',
    author: 'retrodaydream',
    likes: 341,
    views: '2.1k',
    badge: 'MOST NOSTALGIC',
    bg: 'from-yellow-200 via-amber-100 to-orange-100',
    symbol: '★',
    rotate: '-1deg',
  },
]

function ScrapCard({ s, i }: { s: typeof FEATURED[0]; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: i * 0.1 }}
      whileHover={{ scale: 1.03, rotate: 0 }}
      className="scrap-card overflow-hidden cursor-pointer"
      style={{ transform: `rotate(${s.rotate})` }}
    >
      {/* Image area */}
      <div className={`h-52 w-full bg-gradient-to-br ${s.bg} relative overflow-hidden flex items-center justify-center`}>
        {/* Large decorative symbol */}
        <span className="font-pixel text-7xl text-[#3A0030]/20">{s.symbol}</span>

        {/* Badge */}
        <div className="absolute top-3 left-3 bg-white/90 border border-[#FFB6D9] font-pixel text-[#D4006E] px-2 py-1 rounded-full" style={{ fontSize: '8px' }}>
          {s.badge}
        </div>

        {/* Tape strip */}
        <div
          className="absolute top-0 left-1/2 bg-yellow-100/70 px-5 py-0.5 border border-yellow-200/60"
          style={{ transform: 'translateX(-50%) rotate(-1deg)', fontFamily: 'Caveat, cursive', fontSize: '9px', color: '#8B6914' }}
        >
          ✦
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="font-caveat text-xl text-[#3A0030] leading-tight mb-1" style={{ fontFamily: 'Caveat, cursive' }}>
          {s.title}
        </div>
        <div className="font-nunito text-xs text-[#888]">
          by <span className="text-[#FF4FA3] font-bold">@{s.author}</span>
        </div>
        <div className="flex justify-between items-center mt-3">
          <span className="font-nunito text-xs text-[#888]">♡ {s.likes}</span>
          <span className="font-nunito text-xs text-[#888]">◎ {s.views} views</span>
        </div>
      </div>
    </motion.div>
  )
}

export default function FeaturedScrapbooks() {
  return (
    <section className="py-16 lg:py-20 bg-[#FFF0F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="font-pixel text-[#FF4FA3] tracking-widest mb-1" style={{ fontSize: '11px' }}>
              TODAY'S PICKS
            </div>
            <h2 className="font-pacifico text-4xl text-[#3A0030]" style={{ fontFamily: 'Pacifico, cursive' }}>
              Featured Scrapbooks
            </h2>
          </div>
          <Link href="/explore" className="font-pixel text-[#FF4FA3] hover:underline" style={{ fontSize: '11px' }}>
            VIEW ALL →
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED.map((s, i) => (
            <Link key={s.id} href={`/scrapbook/${s.id}`}>
              <ScrapCard s={s} i={i} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
