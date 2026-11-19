'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const SAMPLE_PAGES = [
  { symbol: '♡', title: 'About Me', bg: 'from-pink-300 to-pink-200', rotate: '-6deg', note: 'my name is...' },
  { symbol: '◎', title: 'Memories', bg: 'from-purple-300 to-blue-200', rotate: '4deg', note: 'summer 2004' },
  { symbol: '♪', title: 'My Playlist', bg: 'from-yellow-200 to-orange-200', rotate: '-3deg', note: 'songs on repeat' },
  { symbol: '✿', title: 'Friends', bg: 'from-green-200 to-teal-200', rotate: '7deg', note: 'bff forever' },
  { symbol: '✦', title: 'Dreams', bg: 'from-blue-300 to-purple-200', rotate: '-5deg', note: 'one day...' },
]

export default function Hero() {
  return (
    <section
      className="min-h-[85vh] flex items-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #3A0030 0%, #200040 50%, #100030 100%)' }}
    >
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-float" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-400 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-float" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-16 grid lg:grid-cols-2 gap-12 items-center w-full">
        {/* Left column */}
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-[#FFB6D9]/30 rounded-full px-4 py-1.5 mb-6"
          >
            <span className="animate-blink text-green-400 text-sm">●</span>
            <span className="font-pixel text-[#FFB6D9]/80" style={{ fontSize: '15px' }}>
              ONLINE NOW: 1,247 USERS
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
            className="font-caveat text-[#FFB6D9] mb-3"
            style={{ fontFamily: 'Caveat, cursive', fontSize: '28px' }}
          >
            your little corner of the internet ♡
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="font-nunito text-white/70 text-lg mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed"
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
              MAKE MY SCRAPBOOK
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 px-8 py-3 font-nunito font-bold text-base transition-all hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}
            >
              EXPLORE SCRAPPY
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6"
          >
            <span className="font-pixel text-[#FFB6D9]/50" style={{ fontSize: '15px' }}>
              VISITORS: 48,291 SINCE 2024
            </span>
          </motion.div>
        </div>

        {/* Right column — scrap card collage */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative h-[500px] overflow-hidden hidden lg:block"
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
                <span className="text-4xl font-pixel text-[#3A0030]/50">{page.symbol}</span>
              </div>
              <div className="font-pixel text-[#3A0030] text-center mb-1" style={{ fontSize: '14px' }}>
                {page.title}
              </div>
              <div className="font-caveat text-[#888] text-center italic" style={{ fontFamily: 'Caveat, cursive', fontSize: '14px' }}>
                {page.note}
              </div>
              <div
                className="absolute -top-3 left-1/2 bg-yellow-100/80 px-4 py-0.5 border border-yellow-200"
                style={{ transform: 'translateX(-50%) rotate(-2deg)', fontSize: '8px', fontFamily: 'Caveat, cursive', color: '#8B6914' }}
              >
                ✦
              </div>
            </motion.div>
          ))}

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl animate-sparkle pointer-events-none z-0 text-[#FF4FA3]/40">
            ♡
          </div>
        </motion.div>
      </div>
    </section>
  )
}
