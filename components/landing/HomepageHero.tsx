'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import FloatingScrapbooks from './FloatingScrapbooks'

export default function HomepageHero() {
  return (
    <section style={{ padding: 'clamp(28px, 5vw, 56px) 20px clamp(32px, 5vw, 64px)', maxWidth: 1120, margin: '0 auto' }}>
      <div className="grid lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] gap-6 lg:gap-8 items-center">

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
              fontSize: 'clamp(32px, 4.8vw, 46px)',
              color: 'var(--c-text)',
              lineHeight: 1.45,
              marginBottom: 18,
              textWrap: 'balance',
            }}
          >
            <span className="lg:block lg:whitespace-nowrap">Make scrapbook pages</span>{' '}
            <span className="lg:block">like it&apos;s 2004.</span>
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
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <Link href="/scrapbook/create" className="btn-pill btn-pill-pink justify-center grow sm:grow-0 whitespace-nowrap" style={{ fontSize: 15, padding: "0 20px" }}>
              Make my scrapbook →
            </Link>
            <Link href="/explore" className="btn-pill justify-center grow sm:grow-0 whitespace-nowrap" style={{ fontSize: 15, padding: "0 20px" }}>
              Explore
            </Link>
          </div>
          <p className="font-nunito" style={{ fontSize: 15, color: 'var(--c-text)', opacity: 0.65, marginTop: 18 }}>
            free · no download · works on your phone ✦
          </p>
        </motion.div>

        {/* Right: floating notebook cluster */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.15 }}
        >
          {/* phones + tablets: smaller cluster under the text */}
          <div className="lg:hidden mx-auto" style={{ maxWidth: 440 }}>
            <FloatingScrapbooks compact />
          </div>
          {/* desktop: full cluster beside the text */}
          <div className="hidden lg:block">
            <FloatingScrapbooks />
          </div>
        </motion.div>

      </div>
    </section>
  )
}
