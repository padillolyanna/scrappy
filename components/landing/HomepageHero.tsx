'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

function ScrapbookPreview() {
  const polaroids = [
    { rotate: '-5deg', top: 0, left: 0, bg: 'linear-gradient(135deg, #FFB6D9, #C9A2FF)', title: 'memories 03', sticker: '♡', washi: '#A8DFFF' },
    { rotate: '3deg', top: 25, left: 90, bg: 'linear-gradient(135deg, #FFF0A8, #FFB6D9)', title: 'indie sleaze', sticker: '✦', washi: '#C9A2FF' },
    { rotate: '-1deg', top: 65, left: 40, bg: 'linear-gradient(135deg, #A8DFFF, #C9A2FF)', title: 'my playlist', sticker: '★', washi: '#FFB6D9' },
  ]

  return (
    <div className="relative h-60" style={{ overflow: 'hidden' }}>
      {polaroids.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.2 + i * 0.1 }}
          className="polaroid absolute"
          style={{ width: 115, top: p.top, left: p.left, transform: `rotate(${p.rotate})`, zIndex: i + 1 }}
        >
          <div style={{ width: '100%', height: 85, background: p.bg, borderRadius: 2, position: 'relative', overflow: 'hidden', marginBottom: 4 }}>
            <div aria-hidden="true" style={{ position: 'absolute', top: 7, left: -6, right: -6, height: 9, background: p.washi, opacity: 0.55, transform: 'rotate(-2deg)' }} />
            <div aria-hidden="true" style={{ position: 'absolute', bottom: 5, right: 7, fontSize: 18, opacity: 0.75 }}>{p.sticker}</div>
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 12, color: '#3A0030', textAlign: 'center', paddingBottom: 2 }}>{p.title}</div>
        </motion.div>
      ))}
    </div>
  )
}

export default function HomepageHero() {
  return (
    <section style={{ padding: 'clamp(32px, 5vw, 56px) 20px clamp(40px, 6vw, 64px)', maxWidth: 1120, margin: '0 auto' }}>
      <div className="grid md:grid-cols-[1fr_260px] gap-10 items-center">

        {/* Left: headline + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <h1
            style={{
              fontFamily: "'Chango', 'Arial Black', sans-serif",
              fontSize: 'clamp(32px, 5vw, 52px)',
              color: '#3A0030',
              lineHeight: 1.15,
              marginBottom: 14,
            }}
          >
            Make scrapbook pages<br />like it&apos;s 2004.
          </h1>
          <p
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 'clamp(18px, 2.5vw, 22px)',
              color: '#5A3A50',
              lineHeight: 1.5,
              marginBottom: 28,
              maxWidth: 460,
            }}
          >
            Decorate spiral-notebook pages with photos, washi tape, gems and doodles. Free, and all yours.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/scrapbook/create" className="btn-bevel" style={{ fontSize: 15, padding: '11px 28px' }}>
              Make my scrapbook →
            </Link>
            <Link
              href="/explore"
              className="btn-bevel"
              style={{ fontSize: 15, padding: '11px 24px', background: 'linear-gradient(180deg, #A8E6FF 0%, #6FE3FF 45%, #00BADD 100%)' }}
            >
              Explore scrapbooks
            </Link>
          </div>
        </motion.div>

        {/* Right: scrapbook preview */}
        <motion.div
          className="hidden md:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.15 }}
        >
          <ScrapbookPreview />
        </motion.div>

      </div>
    </section>
  )
}
