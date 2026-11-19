'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import VisitorCounter from '../ui/VisitorCounter'

const SAMPLE_PAGES = [
  { symbol: '♡', title: 'About Me', bg: 'from-pink-200 to-pink-100', rotate: '-6deg', note: 'my name is...' },
  { symbol: '◎', title: 'Memories', bg: 'from-purple-200 to-blue-100', rotate: '4deg', note: 'summer 2004' },
  { symbol: '♪', title: 'My Playlist', bg: 'from-yellow-200 to-orange-100', rotate: '-3deg', note: 'songs on repeat' },
  { symbol: '✿', title: 'Friends', bg: 'from-green-100 to-teal-100', rotate: '7deg', note: 'bff forever' },
  { symbol: '✦', title: 'Dreams', bg: 'from-blue-200 to-purple-100', rotate: '-5deg', note: 'one day...' },
]

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden pt-8 pb-16">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float2" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float3" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/80 border-2 border-[#FFB6D9] rounded-full px-4 py-1.5 mb-6"
          >
            <span className="animate-blink text-[#FF4FA3]">●</span>
            <span className="font-pixel text-xs text-[#3A0030]" style={{ fontSize: '11px' }}>
              YOUR CORNER OF THE INTERNET
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-pacifico mb-4 leading-none"
            style={{ fontFamily: 'Pacifico, cursive', fontSize: 'clamp(60px, 12vw, 120px)' }}
          >
            <span className="text-glitter">SCRAPPY</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-caveat text-2xl text-[#D4006E] mb-3"
            style={{ fontFamily: 'Caveat, cursive', fontSize: '28px' }}
          >
            "Your little corner of the internet." ✦
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="font-nunito text-[#5A2050] text-lg mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed"
          >
            Make memories, collect answers, decorate your pages, and leave a little piece of yourself behind.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
          >
            <Link href="/scrapbook/create" className="btn-y2k text-base px-8 py-3 inline-flex items-center justify-center gap-2">
              ✦ MAKE MY SCRAPBOOK
            </Link>
            <Link href="/explore" className="btn-outline-y2k text-base px-8 py-3 inline-flex items-center justify-center gap-2">
              EXPLORE SCRAPPY
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <VisitorCounter />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative h-[460px] hidden lg:block"
        >
          {SAMPLE_PAGES.map((page, i) => (
            <motion.div
              key={i}
              className="absolute scrap-card w-40 p-4 cursor-pointer"
              style={{
                top: `${[10, 30, 55, 15, 60][i]}%`,
                left: `${[5, 45, 10, 70, 60][i]}%`,
                transform: `rotate(${page.rotate})`,
              }}
              whileHover={{ scale: 1.08, rotate: 0, zIndex: 10 }}
              animate={{
                y: [0, -8, 0],
                transition: { duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 },
              }}
            >
              <div className={`w-full h-24 rounded-sm bg-gradient-to-br ${page.bg} flex items-center justify-center mb-2`}>
                <span className="text-4xl font-pixel text-[#3A0030]/40">{page.symbol}</span>
              </div>
              <div className="font-pixel text-[9px] text-[#3A0030] text-center mb-1" style={{ fontSize: '9px' }}>
                {page.title}
              </div>
              <div className="font-caveat text-xs text-[#888] text-center italic" style={{ fontFamily: 'Caveat, cursive', fontSize: '11px' }}>
                {page.note}
              </div>
              <div
                className="absolute -top-3 left-1/2 bg-yellow-100/80 px-4 py-0.5 text-xs border border-yellow-200"
                style={{ transform: 'translateX(-50%) rotate(-2deg)', fontSize: '8px', fontFamily: 'Caveat, cursive', color: '#8B6914' }}
              >
                ✦
              </div>
            </motion.div>
          ))}

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl animate-sparkle pointer-events-none z-0 text-[#FF4FA3]/30">
            ♡
          </div>
        </motion.div>
      </div>
    </section>
  )
}
