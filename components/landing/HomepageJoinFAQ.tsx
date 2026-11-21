'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const FAQ = [
  { q: 'Is Scrappy free?', a: 'Yes. Making scrapbooks, photo strips and your profile page is free. Ads help keep the site running.' },
  { q: 'Do I need an account?', a: 'You can browse public scrapbooks, highlights and confessions without one. To save your own creations, sign up with your email; it takes a minute.' },
  { q: 'Who can see my scrapbook?', a: 'You choose: public (anyone), link-only (only people with the link) or private (just you). You can change it any time.' },
  { q: 'Does it work on my phone?', a: 'Yes! Scrappy works in any modern browser on phones, tablets and computers.' },
  { q: 'Can I download what I make?', a: 'Photo strips download as PNG images, and scrapbook spreads can be saved as images from the editor.' },
]

const DECO = [
  { g: '✦', style: { top: '16px', left: '24px', fontSize: 48 } },
  { g: '★', style: { bottom: '16px', right: '40px', fontSize: 40 } },
  { g: '♡', style: { top: '50%', left: '12px', fontSize: 32, transform: 'translateY(-50%)' } },
  { g: '✿', style: { top: '24px', right: '20px', fontSize: 36 } },
  { g: '◆', style: { bottom: '32px', left: '25%', fontSize: 28 } },
]

export default function HomepageJoinFAQ() {
  return (
    <>
      {/* Join panel */}
      <section style={{ padding: '0 20px 0', maxWidth: 1120, margin: '0 auto' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #3A0030 0%, #200040 100%)',
            borderRadius: 16,
            padding: 'clamp(32px, 5vw, 48px) 24px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            border: '2px solid #2B0A2E',
            boxShadow: '4px 5px 0 rgba(43,10,46,.25)',
          }}
        >
          {DECO.map(({ g, style }, i) => (
            <span key={i} aria-hidden="true" className="absolute select-none pointer-events-none" style={{ fontFamily: "'VT323', monospace", color: 'rgba(255,255,255,0.05)', ...style }}>{g}</span>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <div aria-hidden="true" style={{ fontFamily: "'VT323', monospace", fontSize: 28, color: '#FF4FA3', marginBottom: 10 }}>✦</div>
            <h2
              style={{
                fontFamily: "'Chango', 'Arial Black', sans-serif",
                color: 'white',
                fontSize: 'clamp(24px, 5vw, 40px)',
                marginBottom: 10,
                lineHeight: 1.2,
              }}
            >
              Claim your little corner.
            </h2>
            <p style={{ fontFamily: "'Caveat', cursive", color: 'rgba(255,182,217,0.8)', fontSize: 18, marginBottom: 24 }}>
              Be one of the first to claim your little corner of the internet.<br />
              It&apos;s free, it&apos;s yours, and it&apos;s exactly as chaotic as you want it to be.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/scrapbook/create" className="btn-bevel" style={{ fontSize: 15, padding: '10px 28px' }}>
                <span aria-hidden="true">✦</span> MAKE MY SCRAPBOOK
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
          </motion.div>
        </div>
      </section>

      {/* FAQ + About */}
      <section style={{ padding: '0 20px clamp(40px, 6vw, 64px)', maxWidth: 1120, margin: '0 auto' }}>
        <div className="mt-8 grid lg:grid-cols-[1fr_1.2fr] gap-5 items-start">
          <div className="bg-white rounded-2xl border-2 border-[#2B0A2E] p-5" style={{ boxShadow: '3px 4px 0 rgba(43,10,46,.18)' }}>
            <h3 className="font-pacifico text-2xl text-[#FF4FA3] mb-2">about scrappy</h3>
            <p className="font-nunito text-[15px] text-[#3A2A35] leading-relaxed">
              Remember decorating your page and filling in quizzes for your best friends? Scrappy brings that cosy, creative internet back. Make a scrapbook, a photo strip, or a profile page that looks exactly how you want.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Link href="/about" className="btn-outline-y2k text-sm px-4 py-2">read more about us</Link>
              <Link href="/explore" className="btn-y2k text-sm px-4 py-2">explore scrapbooks</Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-[#2B0A2E] p-5" style={{ boxShadow: '3px 4px 0 rgba(43,10,46,.18)' }}>
            <h3 className="font-pacifico text-2xl text-[#7C4DDB] mb-2">questions <span aria-hidden="true">♡</span></h3>
            <div className="divide-y-2 divide-[#FFE4F0]">
              {FAQ.map((f) => (
                <details key={f.q} className="py-2 group">
                  <summary className="cursor-pointer list-none flex justify-between items-center gap-3 font-nunito font-extrabold text-base text-[#3A0030]">
                    {f.q}
                    <span aria-hidden="true" className="text-[#FF4FA3] transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                  </summary>
                  <p className="font-nunito text-[15px] text-[#3A2A35] leading-relaxed mt-1">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
