'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function PaperDoll({ style, symbol }: { style: React.CSSProperties; symbol: string }) {
  return (
    <div
      aria-hidden="true"
      className="absolute pointer-events-none select-none"
      style={style}
    >
      {/* Head */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'linear-gradient(135deg, #FFB6D9, #FF9ECF)',
        border: '2px solid #2B0A2E',
        margin: '0 auto',
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 18 }}>{symbol}</span>
      </div>
      {/* Body */}
      <div style={{
        width: 28, height: 40, margin: '2px auto 0',
        background: 'linear-gradient(180deg, #C9A2FF, #FF4FA3)',
        border: '2px solid #2B0A2E',
        borderRadius: '4px 4px 8px 8px',
      }} />
      {/* Bow */}
      <div style={{
        position: 'absolute', top: 32, left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 16,
      }}>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><ellipse cx="4.5" cy="6" rx="4" ry="2.5" fill="#FF4FA3" stroke="#2B0A2E" strokeWidth="1" transform="rotate(-15,4.5,6)"/><ellipse cx="13.5" cy="6" rx="4" ry="2.5" fill="#FF4FA3" stroke="#2B0A2E" strokeWidth="1" transform="rotate(15,13.5,6)"/><circle cx="9" cy="6" r="2" fill="#FF9ECF" stroke="#2B0A2E" strokeWidth="1"/></svg>
      </div>
    </div>
  )
}

export default function SplashScreen() {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    try {
      const seen = localStorage.getItem('scrappy_splash_seen')
      if (!seen) setVisible(true)
    } catch {
      // localStorage unavailable
    }
  }, [])

  function dismiss() {
    setExiting(true)
    setTimeout(() => {
      try {
        localStorage.setItem('scrappy_splash_seen', '1')
      } catch { /* ignore */ }
      setVisible(false)
    }, 400)
  }

  if (!visible) return null

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%233A0030'/%3E%3Ctext x='4' y='18' font-size='10' fill='%23FF4FA3' opacity='0.5'%3E%E2%9C%A6%3C/text%3E%3Ctext x='22' y='34' font-size='8' fill='%23C9A2FF' opacity='0.4'%3E%E2%99%A1%3C/text%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px',
          }}
        >
          {/* Paper doll stickers */}
          <PaperDoll symbol="✦" style={{ top: '12%', left: '8%', transform: 'rotate(-12deg)', animation: 'float 4s ease-in-out infinite' }} />
          <PaperDoll symbol="♡" style={{ top: '15%', right: '10%', transform: 'rotate(8deg)', animation: 'float2 5s ease-in-out infinite' }} />
          <PaperDoll symbol="★" style={{ bottom: '14%', left: '12%', transform: 'rotate(6deg)', animation: 'float3 3s ease-in-out infinite' }} />
          <PaperDoll symbol="✿" style={{ bottom: '18%', right: '8%', transform: 'rotate(-8deg)', animation: 'float 4.5s ease-in-out infinite 0.5s' }} />

          {/* Sparkle decorations */}
          {['top-1/4 left-1/4', 'top-1/4 right-1/4', 'bottom-1/4 left-1/3', 'bottom-1/4 right-1/3'].map((pos, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`absolute font-pixel text-[#FF4FA3] select-none pointer-events-none animate-twinkle`}
              style={{
                fontSize: `${14 + i * 4}px`,
                animationDelay: `${i * 0.4}s`,
                top: ['25%','25%','75%','75%'][i],
                left: ['25%',undefined,'33%',undefined][i] as string | undefined,
                right: [undefined,'25%',undefined,'33%'][i] as string | undefined,
              }}
            >
              ✦
            </span>
          ))}

          {/* Main card */}
          <motion.div
            initial={{ scale: 0.7, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              background: 'white',
              border: '3px solid #2B0A2E',
              borderRadius: '16px',
              padding: '36px 40px',
              maxWidth: 600,
              width: '94%',
              textAlign: 'center',
              boxShadow: '6px 6px 0 #2B0A2E, 0 0 60px rgba(255,79,163,0.4)',
              position: 'relative',
              overflow: 'visible',
            }}
          >
            {/* Glossy SCRAPPY wordmark */}
            <div
              className="logo-glint"
              style={{
                fontFamily: "'Chango', 'Arial Black', sans-serif",
                fontSize: 'clamp(38px, 9vw, 56px)',
                background: 'linear-gradient(180deg, #FF9ECF 0%, #FF4FA3 45%, #D4006A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(2px 3px 0px #2B0A2E)',
                letterSpacing: '0.04em',
                lineHeight: 1.2,
                marginBottom: 8,
                padding: '4px 0 8px',
                position: 'relative',
                display: 'block',
              }}
            >
              SCRAPPY
            </div>

            <p
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 20,
                color: '#FF4FA3',
                marginBottom: 24,
              }}
            >
              your little corner of the internet ✦
            </p>

            {/* Sticky note */}
            <div
              className="sticky-note"
              style={{
                background: '#FFF0A8',
                border: '1.5px solid rgba(139,105,20,0.25)',
                borderRadius: 4,
                padding: '10px 14px',
                transform: 'rotate(-2deg)',
                marginBottom: 24,
                fontSize: 14,
                fontFamily: "'Caveat', cursive",
                color: '#3A0030',
                display: 'inline-block',
              }}
            >
              no boys allowed... jk. but knock first! ✦
            </div>

            {/* Enter button */}
            <div>
              <button
                onClick={dismiss}
                className="btn-bevel"
                style={{
                  fontFamily: "'Chango', 'Arial Black', sans-serif",
                  fontSize: 18,
                  padding: '12px 36px',
                  borderRadius: '50px',
                }}
              >
                Enter! ♡
              </button>
            </div>

            {/* Skip link */}
            <div style={{ marginTop: 12 }}>
              <button
                onClick={dismiss}
                style={{
                  fontFamily: "'VT323', monospace",
                  fontSize: 14,
                  color: '#888',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                skip intro
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
