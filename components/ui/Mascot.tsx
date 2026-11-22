'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const TIPS = [
  'decorate your page! ✦',
  'post a confession!',
  'try the daily prompt! ★',
]

export default function Mascot() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [bubble, setBubble] = useState<string | null>(null)
  const [waving, setWaving] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const posRef = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const didDrag = useRef(false)

  function syncPos(p: { x: number; y: number }) {
    posRef.current = p
    setPos(p)
  }

  useEffect(() => {
    const saved = localStorage.getItem('mascot-pos')
    if (saved) {
      try {
        const p = JSON.parse(saved) as { x: number; y: number }
        syncPos({ x: Math.max(0, p.x), y: Math.max(0, p.y) })
      } catch {
        syncPos({ x: window.innerWidth - 90, y: 80 })
      }
    } else {
      syncPos({ x: window.innerWidth - 90, y: 80 })
    }

    if (!localStorage.getItem('mascot-hint')) {
      const t1 = setTimeout(() => setShowHint(true), 800)
      const t2 = setTimeout(() => {
        setShowHint(false)
        localStorage.setItem('mascot-hint', '1')
      }, 4500)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [])

  // pageX/pageY = clientX + scrollX, so drag position is document-relative
  const onMouseMove = useCallback((e: MouseEvent) => {
    didDrag.current = true
    const newPos = {
      x: Math.max(0, e.pageX - dragOffset.current.x),
      y: Math.max(0, e.pageY - dragOffset.current.y),
    }
    syncPos(newPos)
  }, [])

  const onMouseUp = useCallback(() => {
    setDragging(false)
    if (posRef.current) localStorage.setItem('mascot-pos', JSON.stringify(posRef.current))
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }, [onMouseMove])

  function handleMouseDown(e: React.MouseEvent) {
    if (!posRef.current) return
    e.preventDefault()
    // pageX = clientX + scrollX — gives document coordinate
    dragOffset.current = {
      x: e.pageX - posRef.current.x,
      y: e.pageY - posRef.current.y,
    }
    didDrag.current = false
    setDragging(true)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  const onTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault()
    didDrag.current = true
    const t = e.touches[0]
    const newPos = {
      x: Math.max(0, t.pageX - dragOffset.current.x),
      y: Math.max(0, t.pageY - dragOffset.current.y),
    }
    syncPos(newPos)
  }, [])

  const onTouchEnd = useCallback(() => {
    setDragging(false)
    if (posRef.current) localStorage.setItem('mascot-pos', JSON.stringify(posRef.current))
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', onTouchEnd)
  }, [onTouchMove])

  function handleTouchStart(e: React.TouchEvent) {
    if (!posRef.current) return
    const t = e.touches[0]
    dragOffset.current = {
      x: t.pageX - posRef.current.x,
      y: t.pageY - posRef.current.y,
    }
    didDrag.current = false
    setDragging(true)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
  }

  function handleClick() {
    if (didDrag.current) return
    setShowHint(false)
    const tip = TIPS[Math.floor(Math.random() * TIPS.length)]
    setBubble(tip)
    setWaving(true)
    setTimeout(() => setBubble(null), 3000)
    setTimeout(() => setWaving(false), 800)
  }

  if (!pos) return null

  const activeBubble = bubble ?? (showHint ? 'sama mo ako! ✦' : null)

  return (
    <div
      style={{
        // absolute = document coordinates, stays put when page scrolls
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        zIndex: 9999,
        userSelect: 'none',
        touchAction: 'none',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
    >
      {activeBubble && (
        <div style={{
          position: 'absolute',
          bottom: '110%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: 4,
          background: 'white',
          border: '2px solid #2B0A2E',
          borderRadius: 8,
          padding: '5px 10px',
          fontFamily: "'Caveat', cursive",
          fontSize: 13,
          color: '#2B0A2E',
          whiteSpace: 'nowrap',
          boxShadow: '2px 2px 0 #2B0A2E',
          pointerEvents: 'none',
        }}>
          {activeBubble}
          <div style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid #2B0A2E' }} />
          <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '7px solid white' }} />
        </div>
      )}

      {showHint && (
        <div style={{
          position: 'absolute',
          top: '110%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: 4,
          fontFamily: "'Caveat', cursive",
          fontSize: 11,
          color: '#FF4FA3',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          opacity: 0.85,
        }}>
          drag me ✦
        </div>
      )}

      <div
        className="animate-mascot-idle"
        style={{ width: 54, position: 'relative', cursor: dragging ? 'grabbing' : 'grab' }}
      >
        {/* Head */}
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #FFB6D9, #FF9ECF)', border: '2px solid #2B0A2E', margin: '0 auto', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 7, marginTop: 2 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2B0A2E' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2B0A2E' }} />
          </div>
          <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', lineHeight: 1 }}>
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
              <ellipse cx="4.5" cy="6" rx="4" ry="2.5" fill="#FF4FA3" stroke="#2B0A2E" strokeWidth="1" transform="rotate(-15,4.5,6)"/>
              <ellipse cx="13.5" cy="6" rx="4" ry="2.5" fill="#FF4FA3" stroke="#2B0A2E" strokeWidth="1" transform="rotate(15,13.5,6)"/>
              <circle cx="9" cy="6" r="2" fill="#FF9ECF" stroke="#2B0A2E" strokeWidth="1"/>
            </svg>
          </div>
        </div>
        {/* Body */}
        <div style={{ width: 30, height: 32, margin: '2px auto 0', background: 'linear-gradient(180deg, #C9A2FF, #FF4FA3)', border: '2px solid #2B0A2E', borderRadius: '4px 4px 10px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'white', fontSize: 12, opacity: 0.8 }}>✦</span>
        </div>
        {/* Wand arm */}
        <div style={{ position: 'absolute', bottom: 10, right: -4, transform: waving ? 'rotate(-25deg)' : 'rotate(-5deg)', transition: 'transform 0.3s ease', transformOrigin: 'bottom left' }}>
          <div style={{ width: 4, height: 20, background: '#C9A2FF', border: '1px solid #2B0A2E', borderRadius: 2, margin: '0 auto' }} />
          <div style={{ textAlign: 'center', fontSize: 12, marginTop: -2, lineHeight: 1 }}>✦</div>
        </div>
      </div>
    </div>
  )
}
