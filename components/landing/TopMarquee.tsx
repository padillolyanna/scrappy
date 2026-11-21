'use client'

import { useState } from 'react'

const TEXT = 'SCRAPPY — YOUR LITTLE CORNER OF THE INTERNET ✦ MAKE MEMORIES ✦ DECORATE YOUR PAGES ✦ COLLECT ANSWERS ✦ SHARE YOUR STORY ✦ '
const DOUBLED = TEXT + TEXT

export default function TopMarquee() {
  const [paused, setPaused] = useState(false)

  return (
    <div
      style={{
        background: 'var(--c-primary, #FF4FA3)',
        overflow: 'hidden',
        padding: '5px 0',
        borderBottom: '2px solid #2B0A2E',
        display: 'flex',
        alignItems: 'center',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div style={{ flex: 1, overflow: 'hidden' }} aria-hidden="true">
        <div
          style={{
            display: 'flex',
            whiteSpace: 'nowrap',
            animation: paused ? 'none' : 'marquee 40s linear infinite',
          }}
        >
          <span style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: 'white', letterSpacing: '0.06em', display: 'inline-block' }}>
            {DOUBLED}
          </span>
          <span style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: 'white', letterSpacing: '0.06em', display: 'inline-block' }}>
            {DOUBLED}
          </span>
        </div>
      </div>
      <button
        onClick={() => setPaused(p => !p)}
        aria-label={paused ? 'Resume ticker' : 'Pause ticker'}
        style={{
          marginRight: 8,
          flexShrink: 0,
          background: 'rgba(255,255,255,0.22)',
          border: '1px solid rgba(255,255,255,0.4)',
          color: 'white',
          borderRadius: 3,
          padding: '0 7px',
          fontSize: 11,
          cursor: 'pointer',
          fontFamily: "'VT323', monospace",
          lineHeight: '20px',
          height: 20,
        }}
      >
        {paused ? '▶' : '⏸'}
      </button>
    </div>
  )
}
