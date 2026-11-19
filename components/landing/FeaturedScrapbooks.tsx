'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const FEATURED = [
  {
    id: '1',
    title: 'my chaotic little life',
    author: 'stargirl404',
    cover_symbol: '✦',
    bg: 'from-pink-200 to-purple-200',
    pages: 8,
    likes: 234,
    badge: 'MOST CREATIVE',
    rotate: '-2deg',
    tags: ['aesthetic', 'diary', 'y2k'],
  },
  {
    id: '2',
    title: 'summer 2004 forever',
    author: 'nostalgiaxo',
    cover_symbol: '◎',
    bg: 'from-yellow-200 to-orange-200',
    pages: 12,
    likes: 189,
    badge: 'COMMUNITY FAV',
    rotate: '1.5deg',
    tags: ['nostalgia', 'memories', '2000s'],
  },
  {
    id: '3',
    title: 'the playlist of my life',
    author: 'melodydreamer',
    cover_symbol: '♪',
    bg: 'from-blue-200 to-teal-200',
    pages: 6,
    likes: 156,
    badge: 'EDITORS PICK',
    rotate: '-1deg',
    tags: ['music', 'playlist', 'vibes'],
  },
  {
    id: '4',
    title: 'best friends forever :)',
    author: 'twinstars99',
    cover_symbol: '♡',
    bg: 'from-purple-200 to-pink-200',
    pages: 10,
    likes: 312,
    badge: 'TOP RATED',
    rotate: '2deg',
    tags: ['friends', 'friendship', 'bff'],
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
      className="scrap-card relative bg-white overflow-hidden cursor-pointer"
      style={{ transform: `rotate(${s.rotate})` }}
    >
      <div className="absolute top-3 left-3 z-10">
        <span className="bg-white/90 font-pixel text-[8px] px-2 py-1 rounded-full border border-[#FFB6D9] text-[#D4006E]" style={{ fontSize: '8px' }}>
          ✦ {s.badge}
        </span>
      </div>

      <div className={`h-48 bg-gradient-to-br ${s.bg} flex items-center justify-center relative overflow-hidden`}>
        <div className="text-7xl font-pixel text-[#3A0030]/30">{s.cover_symbol}</div>
        <div className="absolute top-2 right-3 text-sm opacity-60 animate-sparkle text-[#3A0030]/40">✦</div>
        <div className="absolute bottom-3 left-3 text-xs opacity-40 text-[#3A0030]/30">★ ★ ★</div>
      </div>

      <div className="p-4">
        <div
          className="font-caveat text-xl text-[#3A0030] mb-1 leading-tight"
          style={{ fontFamily: 'Caveat, cursive', fontSize: '20px' }}
        >
          {s.title}
        </div>
        <div className="font-nunito text-xs text-[#888] mb-3">
          by <span className="text-[#FF4FA3] font-bold">@{s.author}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {s.tags.map((t) => (
              <span key={t} className="bg-[#FFB6D9]/30 text-[#D4006E] font-nunito text-xs px-2 py-0.5 rounded-full">
                #{t}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-[#888] font-nunito">
            <span>{s.pages}p</span>
            <span>♡ {s.likes}</span>
          </div>
        </div>
      </div>

      <div
        className="absolute -top-2 left-1/2 bg-[#FFF0A8]/80 px-5 py-0.5 border border-[#F0D080]/50"
        style={{ transform: 'translateX(-50%) rotate(-1.5deg)', fontFamily: 'Caveat, cursive', fontSize: '10px', color: '#8B6914' }}
      >
        ✦ featured ✦
      </div>
    </motion.div>
  )
}

export default function FeaturedScrapbooks() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block"
          >
            <div className="font-pixel text-xs text-[#FF4FA3] mb-2 tracking-widest" style={{ fontSize: '11px' }}>
              ✦ COMMUNITY SPOTLIGHT ✦
            </div>
            <h2
              className="font-pacifico text-5xl text-[#3A0030]"
              style={{ fontFamily: 'Pacifico, cursive', fontSize: 'clamp(32px, 6vw, 52px)' }}
            >
              featured scrapbooks
            </h2>
            <div className="mt-2 font-caveat text-lg text-[#888]" style={{ fontFamily: 'Caveat, cursive' }}>
              crafted with love by the community
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED.map((s, i) => (
            <Link key={s.id} href={`/scrapbook/${s.id}`}>
              <ScrapCard s={s} i={i} />
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/explore" className="btn-outline-y2k">
            see all scrapbooks
          </Link>
        </div>
      </div>
    </section>
  )
}
