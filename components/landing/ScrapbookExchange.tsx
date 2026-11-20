'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface ExchangeStats {
  total: number
  today: number
}

interface Props {
  exchangeStats?: ExchangeStats | null
}

const STEPS = [
  'Choose a template and answer 10 community questions.',
  'Get matched with someone who answered the same set.',
  'Reveal answers together and find your similarities.',
  'Create a friendship scrapbook page from your exchange.',
]

function FoldedNote() {
  const [unfolded, setUnfolded] = useState(false)

  return (
    <div style={{ perspective: 600 }}>
      <motion.div
        onHoverStart={() => setUnfolded(true)}
        onHoverEnd={() => setUnfolded(false)}
        animate={{ rotateX: unfolded ? 0 : -15 }}
        transition={{ duration: 0.4 }}
        style={{
          transformOrigin: 'top center',
          background: '#FFF8ED',
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 23px,
            rgba(100,160,220,0.2) 23px,
            rgba(100,160,220,0.2) 24px
          )`,
          border: '2px solid #2B0A2E',
          borderRadius: '4px 4px 4px 4px',
          padding: '16px 16px 16px 40px',
          position: 'relative',
          boxShadow: '3px 3px 0 #2B0A2E',
          maxWidth: 300,
        }}
      >
        <div style={{
          position: 'absolute',
          left: 28, top: 0, bottom: 0,
          width: 1.5,
          background: 'rgba(255,100,100,0.5)',
        }} />

        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 0, height: 0,
          borderTop: '28px solid #C8945A',
          borderLeft: '28px solid transparent',
        }} />
        <div style={{
          position: 'absolute', top: 2, right: 2,
          width: 0, height: 0,
          borderTop: '24px solid #FFF8ED',
          borderLeft: '24px solid transparent',
        }} />

        <div style={{
          fontFamily: "'Chango', 'Arial Black', sans-serif",
          fontSize: 12,
          color: '#FF4FA3',
          marginBottom: 10,
          letterSpacing: '0.08em',
        }}>
          PASS THIS NOTE ♡
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 12, color: '#888', marginBottom: 4, fontWeight: 'bold' }}>
              question 1:
            </div>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 13, color: '#3A0030', lineHeight: 1.3 }}>
              your first online username?
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 12, color: '#888', marginBottom: 4, fontWeight: 'bold' }}>
              question 2:
            </div>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 13, color: '#7C4DDB', lineHeight: 1.3 }}>
              song that defined you?
            </div>
          </div>
        </div>

        <div style={{
          background: '#E8F8F0',
          border: '1px solid #28C840',
          borderRadius: 4,
          padding: '3px 8px',
          fontFamily: "'VT323', monospace",
          fontSize: 12,
          color: '#28C840',
          display: 'inline-block',
        }}>
          WAITING FOR YOUR MATCH ♡
        </div>
      </motion.div>
    </div>
  )
}

export default function ScrapbookExchange({ exchangeStats }: Props) {
  return (
    <section style={{ padding: '0 20px 20px' }}>
      <div className="panel-header">✉ scrapbook exchange</div>
      <div className="widget-box" style={{ padding: '16px' }}>
        <div
          className="animate-starburst"
          style={{
            display: 'inline-block',
            background: '#FF4FA3',
            color: 'white',
            fontFamily: "'Chango', 'Arial Black', sans-serif",
            fontSize: 12,
            padding: '3px 10px',
            border: '2px solid #2B0A2E',
            borderRadius: 4,
            boxShadow: '1px 1px 0 #2B0A2E',
            marginBottom: 14,
          }}
        >
          NEW FEATURE
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <FoldedNote />

            <div style={{ marginTop: 20 }}>
              <div style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: '#888', marginBottom: 8 }}>
                HOW IT WORKS:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {STEPS.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: '#FF4FA3', color: 'white',
                      fontFamily: "'Chango', 'Arial Black', sans-serif",
                      fontSize: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid #2B0A2E', flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <p style={{ fontFamily: 'Verdana, sans-serif', fontSize: 12, color: '#3A0030', paddingTop: 2, lineHeight: 1.4 }}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
          >
            <h2 style={{ fontFamily: "'Chango', 'Arial Black', sans-serif", fontSize: 24, color: '#3A0030', marginBottom: 8 }}>
              Scrapbook Exchange
            </h2>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: '#888', marginBottom: 10 }}>
              pass notes with a stranger. find your people.
            </p>
            <p style={{ fontFamily: 'Verdana, sans-serif', fontSize: 12, color: '#5A2050', lineHeight: 1.6, marginBottom: 16 }}>
              Answer the same questions as a stranger or friend. Reveal your answers together and discover similarities, differences, and memories you never knew existed. It&apos;s like passing notes — but make it digital.
            </p>

            {exchangeStats && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {exchangeStats.total > 0 && (
                  <span style={{
                    fontFamily: "'VT323', monospace", fontSize: 13, color: '#FF4FA3',
                    background: '#FFF0F7', border: '1.5px solid #FFB6D9',
                    borderRadius: 20, padding: '2px 10px',
                  }}>
                    ✦ {exchangeStats.total.toLocaleString()} exchanges done
                  </span>
                )}
                {exchangeStats.today > 0 && (
                  <span style={{
                    fontFamily: "'VT323', monospace", fontSize: 13, color: '#FF4FA3',
                    background: '#FFF0F7', border: '1.5px solid #FFB6D9',
                    borderRadius: 20, padding: '2px 10px',
                  }}>
                    ★ {exchangeStats.today} exchanges today
                  </span>
                )}
              </div>
            )}

            <Link href="/exchange" className="btn-bevel" style={{ fontSize: 14 }}>
              START AN EXCHANGE ♡
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
