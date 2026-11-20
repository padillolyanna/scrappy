'use client'

import { useState, useEffect } from 'react'

const TIPS = [
  'decorate your page! ✦',
  'post a confession!',
  'try the daily prompt! ★',
]

export default function Mascot() {
  const [bubble, setBubble] = useState<string | null>(null)
  const [waving, setWaving] = useState(false)

  function handleClick() {
    const tip = TIPS[Math.floor(Math.random() * TIPS.length)]
    setBubble(tip)
    setTimeout(() => setBubble(null), 3000)
  }

  function handleHover() {
    setWaving(true)
    setTimeout(() => setWaving(false), 800)
  }

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      {/* Speech bubble */}
      {bubble && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            marginBottom: 8,
            background: 'white',
            border: '2px solid #2B0A2E',
            borderRadius: 8,
            padding: '6px 10px',
            fontFamily: "'Caveat', cursive",
            fontSize: 13,
            color: '#2B0A2E',
            whiteSpace: 'nowrap',
            boxShadow: '2px 2px 0 #2B0A2E',
            zIndex: 30,
          }}
        >
          {bubble}
          {/* tail */}
          <div style={{
            position: 'absolute',
            bottom: -8,
            right: 16,
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '8px solid #2B0A2E',
          }} />
          <div style={{
            position: 'absolute',
            bottom: -6,
            right: 17,
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '7px solid white',
          }} />
        </div>
      )}

      {/* Mascot figure */}
      <div
        onClick={handleClick}
        onMouseEnter={handleHover}
        className="animate-mascot-idle"
        style={{ cursor: 'pointer', width: 54 }}
      >
        {/* Head */}
        <div style={{
          width: 36, height: 36,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFB6D9, #FF9ECF)',
          border: '2px solid #2B0A2E',
          margin: '0 auto',
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Eyes */}
          <div style={{ display: 'flex', gap: 7, marginTop: 2 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2B0A2E' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2B0A2E' }} />
          </div>
          {/* Bow on top */}
          <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', lineHeight: 1 }}>
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><ellipse cx="4.5" cy="6" rx="4" ry="2.5" fill="#FF4FA3" stroke="#2B0A2E" strokeWidth="1" transform="rotate(-15,4.5,6)"/><ellipse cx="13.5" cy="6" rx="4" ry="2.5" fill="#FF4FA3" stroke="#2B0A2E" strokeWidth="1" transform="rotate(15,13.5,6)"/><circle cx="9" cy="6" r="2" fill="#FF9ECF" stroke="#2B0A2E" strokeWidth="1"/></svg>
          </div>
        </div>

        {/* Body */}
        <div style={{
          width: 30, height: 32,
          margin: '2px auto 0',
          background: 'linear-gradient(180deg, #C9A2FF, #FF4FA3)',
          border: '2px solid #2B0A2E',
          borderRadius: '4px 4px 10px 10px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Star on body */}
          <span style={{ color: 'white', fontSize: 12, opacity: 0.8 }}>✦</span>
        </div>

        {/* Wand arm */}
        <div style={{
          position: 'absolute',
          bottom: 10,
          right: -4,
          transform: waving ? 'rotate(-25deg)' : 'rotate(-5deg)',
          transition: 'transform 0.3s ease',
          transformOrigin: 'bottom left',
        }}>
          <div style={{
            width: 4,
            height: 20,
            background: '#C9A2FF',
            border: '1px solid #2B0A2E',
            borderRadius: 2,
            margin: '0 auto',
          }} />
          <div style={{ textAlign: 'center', fontSize: 10, marginTop: -2, lineHeight: 1 }}>✦</div>
        </div>
      </div>
    </div>
  )
}
