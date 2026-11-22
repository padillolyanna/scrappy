'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import FloatingScrapbooks from './FloatingScrapbooks'

export default function HomepageHero() {
  return (
    <section style={{ padding: 'clamp(32px, 5vw, 64px) 20px clamp(40px, 6vw, 72px)', maxWidth: 1120, margin: '0 auto' }}>
      <div className="grid md:grid-cols-[1fr_380px] gap-10 items-center">

        {/* Left: headline + CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <div
            className="font-silkscreen tracking-widest mb-3"
            style={{ fontSize: '11px', color: '#E0007A' }}
          >
            YOUR CORNER OF THE INTERNET
          </div>
          <h1
            className="font-pacifico"
            style={{
              fontSize: 'clamp(36px, 5.5vw, 60px)',
              color: 'var(--c-text)',
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Make scrapbook pages<br />like it&apos;s 2004.
          </h1>
          <p
            className="font-nunito"
            style={{
              fontSize: 'clamp(16px, 2vw, 19px)',
              color: 'var(--c-text)',
              opacity: 0.75,
              lineHeight: 1.6,
              marginBottom: 32,
              maxWidth: 460,
            }}
          >
            Decorate spiral-notebook pages with photos, washi tape, gems and doodles. Free, and completely yours.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link href="/scrapbook/create" className="btn-pill btn-pill-pink" style={{ fontSize: 15 }}>
              Make my scrapbook →
            </Link>
            <Link href="/explore" className="btn-pill" style={{ fontSize: 15 }}>
              Explore
            </Link>
          </div>
        </motion.div>

        {/* Right: floating notebook cluster */}
        <motion.div
          className="hidden md:block"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.15 }}
        >
          <FloatingScrapbooks />
        </motion.div>

      </div>
    </section>
  )
}
