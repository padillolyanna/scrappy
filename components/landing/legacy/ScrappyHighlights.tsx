'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const SIDEBAR_ENTRIES = [
  {
    title: 'Kawaii Dream Paper',
    creator: 'littlesparkles',
    votes: 523,
    gradient: 'from-pink-300 to-pink-200',
    symbol: '♡',
  },
  {
    title: 'Film Roll Memories',
    creator: 'analogdiary',
    votes: 441,
    gradient: 'from-amber-300 to-yellow-200',
    symbol: '◎',
  },
  {
    title: 'Glitter & Chrome',
    creator: 'glittergirl',
    votes: 389,
    gradient: 'from-purple-300 to-blue-200',
    symbol: '✦',
  },
]

export default function ScrappyHighlights() {
  return (
    <section className="py-16 lg:py-20 bg-[#F5F0FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="font-pixel text-[#FF4FA3] tracking-widest mb-1" style={{ fontSize: '11px' }}>
              COMMUNITY PICKS
            </div>
            <h2 className="font-pacifico text-4xl text-[#3A0030]" style={{ fontFamily: 'Pacifico, cursive' }}>
              Scrappy Highlights
            </h2>
          </div>
          <Link href="/highlights" className="font-pixel text-[#FF4FA3] hover:underline" style={{ fontSize: '11px' }}>
            VIEW ALL →
          </Link>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-[62%_38%] gap-8">
          {/* MAIN FEATURED */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="scrap-card overflow-hidden rounded-xl"
          >
            {/* Preview area */}
            <div
              className="h-72 relative overflow-hidden flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2A0028, #4A0060, #1A0040)' }}
            >
              {/* Decorative symbols */}
              <div className="absolute top-4 left-6 font-pixel text-5xl text-white/5 select-none">✦</div>
              <div className="absolute bottom-4 right-8 font-pixel text-4xl text-white/5 select-none">★</div>
              <div className="absolute top-1/3 right-16 font-pixel text-3xl text-white/5 select-none">♡</div>
              <div className="absolute bottom-10 left-12 font-pixel text-3xl text-white/5 select-none">◆</div>

              {/* Fake pages */}
              <div className="absolute top-6 left-8 w-24 h-16 bg-pink-200/20 rounded rotate-[-8deg]" />
              <div className="absolute bottom-8 right-10 w-20 h-14 bg-purple-200/20 rounded rotate-[6deg]" />
              <div className="absolute top-12 right-6 w-16 h-20 bg-blue-200/20 rounded rotate-[-3deg]" />

              {/* Center label */}
              <span className="font-pixel text-white text-sm relative z-10" style={{ fontSize: '12px' }}>
                INDIE SLEAZE SUMMER 2024
              </span>
            </div>

            {/* Card content */}
            <div className="p-5">
              <div className="flex gap-2 mb-3 flex-wrap">
                <span className="bg-[#FF4FA3] text-white font-pixel px-2 py-1 rounded-full" style={{ fontSize: '8px' }}>
                  SCRAPBOOK OF THE DAY
                </span>
                <span className="bg-[#C9B6FF] text-[#3A0030] font-pixel px-2 py-1 rounded-full" style={{ fontSize: '8px' }}>
                  FEATURED
                </span>
              </div>
              <h3 className="font-caveat text-2xl text-[#3A0030] mb-1" style={{ fontFamily: 'Caveat, cursive' }}>
                Indie Sleaze Summer 2024
              </h3>
              <div className="font-nunito font-bold text-[#FF4FA3] text-sm mb-1">@vintagevibes</div>
              <div className="font-nunito text-sm text-[#888] mb-4">Theme: Indie Sleaze · 24 pages</div>
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[#3A0030]" style={{ fontSize: '11px' }}>847 VOTES</span>
                <button className="btn-y2k px-4 py-1.5 text-sm">♡ VOTE</button>
              </div>
            </div>
          </motion.div>

          {/* SIDEBAR */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="font-pixel text-[#888] mb-4" style={{ fontSize: '10px' }}>
              MORE HIGHLIGHTS
            </div>
            <div className="space-y-4">
              {SIDEBAR_ENTRIES.map((entry, i) => (
                <div
                  key={i}
                  className="flex gap-3 items-center p-3 bg-white rounded-xl border border-[#C9B6FF]/30 hover:border-[#C9B6FF] transition-colors cursor-pointer"
                >
                  <div
                    className={`w-14 h-14 rounded-lg bg-gradient-to-br ${entry.gradient} shrink-0 flex items-center justify-center`}
                  >
                    <span className="font-pixel text-2xl text-white/30">{entry.symbol}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-caveat text-base text-[#3A0030] leading-tight" style={{ fontFamily: 'Caveat, cursive' }}>
                      {entry.title}
                    </div>
                    <div className="font-nunito text-xs text-[#888]">@{entry.creator}</div>
                    <div className="font-pixel text-[#FF4FA3] mt-0.5" style={{ fontSize: '10px' }}>
                      {entry.votes} votes
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
