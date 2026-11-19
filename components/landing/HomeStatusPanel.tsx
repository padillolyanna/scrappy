'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

// Three tilted polaroid scrapbook pages (CSS-drawn)
function PolaroidCollage() {
  const pages = [
    {
      rotate: '-6deg',
      top: 0,
      left: 0,
      bg: 'linear-gradient(135deg, #FFB6D9, #C9A2FF)',
      title: 'indie sleaze',
      sticker: '✦',
      washi: '#A8DFFF',
    },
    {
      rotate: '4deg',
      top: 20,
      left: 70,
      bg: 'linear-gradient(135deg, #FFF0A8, #FFB6D9)',
      title: 'memories 03',
      sticker: '♡',
      washi: '#C9A2FF',
    },
    {
      rotate: '-2deg',
      top: 55,
      left: 30,
      bg: 'linear-gradient(135deg, #A8DFFF, #C9A2FF)',
      title: 'my playlist',
      sticker: '★',
      washi: '#FFB6D9',
    },
  ]

  return (
    <div className="relative w-full h-56 md:h-64">
      {pages.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
          animate={{ opacity: 1, scale: 1, rotate: p.rotate as unknown as number }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 + i * 0.1 }}
          whileHover={{ scale: 1.06, rotate: 0, zIndex: 10 }}
          className="polaroid absolute cursor-pointer"
          style={{
            width: 110,
            top: `${p.top}px`,
            left: `${p.left}px`,
            zIndex: i,
          }}
        >
          {/* Photo area */}
          <div
            style={{
              width: '100%',
              height: 80,
              background: p.bg,
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
              marginBottom: 4,
            }}
          >
            {/* Washi tape strip */}
            <div style={{
              position: 'absolute',
              top: 6,
              left: -6,
              right: -6,
              height: 10,
              background: p.washi,
              opacity: 0.6,
              transform: 'rotate(-3deg)',
            }} />
            {/* Sticker */}
            <div style={{
              position: 'absolute',
              bottom: 4,
              right: 6,
              fontSize: 20,
              lineHeight: 1,
              opacity: 0.7,
            }}>
              {p.sticker}
            </div>
            {/* Small "photo" rect */}
            <div style={{
              position: 'absolute',
              top: 22,
              left: 8,
              width: 40,
              height: 32,
              background: 'rgba(255,255,255,0.3)',
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.5)',
            }} />
          </div>
          {/* Polaroid caption */}
          <div style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 12,
            color: '#3A0030',
            textAlign: 'center',
            paddingBottom: 4,
          }}>
            {p.title}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default function HomeStatusPanel() {
  return (
    <div
      className="relative"
      style={{ padding: '20px 20px 10px' }}
    >
      {/* Sticker decorations */}
      <span aria-hidden="true" className="absolute top-2 right-2 text-2xl pointer-events-none select-none animate-sparkle" style={{ color: '#FF4FA3' }}>✦</span>
      <span aria-hidden="true" className="absolute bottom-0 left-1/2 text-lg pointer-events-none select-none" style={{ color: '#C9A2FF', transform: 'translateX(-50%)' }}>♡</span>

      <div className="grid md:grid-cols-[1fr_200px] gap-6 items-start">
        {/* LEFT: AIM-style away message bubble */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Speech bubble card */}
          <div style={{
            background: 'white',
            border: '2px solid #2B0A2E',
            borderRadius: 8,
            padding: '14px 16px',
            position: 'relative',
            marginBottom: 20,
          }}>
            {/* Tail */}
            <div style={{
              position: 'absolute',
              bottom: -12,
              left: 24,
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '12px solid #2B0A2E',
            }} />
            <div style={{
              position: 'absolute',
              bottom: -9,
              left: 25,
              width: 0,
              height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderTop: '10px solid white',
            }} />

            <p style={{
              fontFamily: "'Chango', 'Arial Black', sans-serif",
              fontSize: 15,
              color: '#3A0030',
              lineHeight: 1.4,
            }}>
              ✦ scrapbook of the day: Indie Sleaze Summer 2024 by{' '}
              <span style={{ color: '#FF4FA3' }}>@vintagevibes</span> ✦
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 flex-wrap mt-5">
            <Link href="/scrapbook/create" className="btn-bevel">
              make my scrapbook →
            </Link>
            <Link href="/explore" className="btn-bevel" style={{
              background: 'linear-gradient(180deg, #A8E6FF 0%, #6FE3FF 45%, #00BADD 100%)',
            }}>
              explore scrappy →
            </Link>
          </div>

          {/* NEW! Starburst badge + Scrapbook Exchange teaser */}
          <div className="flex items-center gap-3 mt-4">
            <div
              className="animate-starburst"
              style={{
                background: '#FF6B00',
                color: 'white',
                fontFamily: "'Chango', 'Arial Black', sans-serif",
                fontSize: 10,
                padding: '3px 8px',
                borderRadius: 4,
                border: '2px solid #2B0A2E',
                boxShadow: '1px 1px 0 #2B0A2E',
                whiteSpace: 'nowrap',
              }}
            >
              NEW!
            </div>
            <span style={{
              fontFamily: "'VT323', monospace",
              fontSize: 15,
              color: '#FF4FA3',
            }}>
              Scrapbook Exchange is live! pass notes with a stranger ♡
            </span>
          </div>
        </motion.div>

        {/* RIGHT: Polaroid collage */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
          className="hidden md:block"
        >
          <PolaroidCollage />
        </motion.div>
      </div>
    </div>
  )
}
