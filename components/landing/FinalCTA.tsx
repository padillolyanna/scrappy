'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface Props {
  isLoggedIn?: boolean
}

export default function FinalCTA({ isLoggedIn }: Props) {
  if (isLoggedIn) return null

  return (
    <section style={{ padding: '0 20px 20px' }}>
      <div className="panel-header">✦ join scrappy!</div>
      <div
        className="widget-box"
        style={{
          padding: '28px 24px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #3A0030 0%, #200040 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span aria-hidden="true" className="absolute top-4 left-6 select-none pointer-events-none" style={{ fontFamily: "'VT323', monospace", fontSize: 48, color: 'rgba(255,255,255,0.05)' }}>✦</span>
        <span aria-hidden="true" className="absolute bottom-4 right-10 select-none pointer-events-none" style={{ fontFamily: "'VT323', monospace", fontSize: 40, color: 'rgba(255,255,255,0.05)' }}>★</span>
        <span aria-hidden="true" className="absolute top-1/2 left-3 select-none pointer-events-none" style={{ fontFamily: "'VT323', monospace", fontSize: 32, color: 'rgba(255,255,255,0.05)', transform: 'translateY(-50%)' }}>♡</span>
        <span aria-hidden="true" className="absolute top-6 right-5 select-none pointer-events-none" style={{ fontFamily: "'VT323', monospace", fontSize: 36, color: 'rgba(255,255,255,0.05)' }}>✿</span>
        <span aria-hidden="true" className="absolute bottom-8 left-1/4 select-none pointer-events-none" style={{ fontFamily: "'VT323', monospace", fontSize: 28, color: 'rgba(255,255,255,0.05)' }}>◆</span>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <div style={{ fontFamily: "'VT323', monospace", fontSize: 28, color: '#FF4FA3', marginBottom: 10 }}>✦</div>

          <h2 style={{
            fontFamily: "'Chango', 'Arial Black', sans-serif",
            color: 'white',
            fontSize: 'clamp(24px, 5vw, 40px)',
            marginBottom: 10,
            lineHeight: 1.2,
          }}>
            Ready to claim your little corner?
          </h2>

          <p style={{
            fontFamily: "'Caveat', cursive",
            color: 'rgba(255,182,217,0.8)',
            fontSize: 18,
            marginBottom: 20,
          }}>
            Join thousands of people decorating their corner of the internet.<br />
            It&apos;s free, it&apos;s yours, and it&apos;s exactly as chaotic as you want it to be.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/scrapbook/create" className="btn-bevel" style={{ fontSize: 15, padding: '10px 28px' }}>
              ✦ MAKE MY SCRAPBOOK
            </Link>
            <Link
              href="/explore"
              className="btn-bevel"
              style={{
                fontSize: 15,
                padding: '10px 28px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                borderColor: 'rgba(255,255,255,0.4)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.2), 2px 2px 0 rgba(255,255,255,0.1)',
              }}
            >
              EXPLORE SCRAPPY
            </Link>
          </div>

          <div style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: 'rgba(255,182,217,0.2)', marginTop: 20, letterSpacing: '0.08em' }}>
            ✦ ★ ♡ ✿ ♪ ◆ ✦ ★ ♡ ✿ ♪ ◆ ✦
          </div>
        </motion.div>
      </div>
    </section>
  )
}
