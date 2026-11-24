'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import PetAvatar, { type PetMood } from '@/components/pet/PetAvatar'
import { usePet } from '@/lib/pet/usePet'

const TIPS = ['hi! ♡', "let's make something!", 'you look cute today!', 'ready to scrapbook?']

export default function Mascot() {
  const { user, guest, pet, newlyUnlocked } = usePet({ claim: 'session' })
  const [mood, setMood] = useState<PetMood>('idle')
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
        syncPos({ x: window.innerWidth - 96, y: window.innerHeight - 150 })
      }
    } else {
      syncPos({ x: window.innerWidth - 96, y: window.innerHeight - 150 })
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

  // sleepy after a minute without activity
  useEffect(() => {
    let t = window.setTimeout(() => setMood('sleepy'), 60000)
    const wake = () => {
      clearTimeout(t)
      setMood((m) => (m === 'sleepy' ? 'idle' : m))
      t = window.setTimeout(() => setMood('sleepy'), 60000)
    }
    const evs = ['pointerdown', 'keydown', 'scroll'] as const
    evs.forEach((e) => window.addEventListener(e, wake, { passive: true }))
    return () => { clearTimeout(t); evs.forEach((e) => window.removeEventListener(e, wake)) }
  }, [])

  function handleClick() {
    if (didDrag.current) return
    setShowHint(false)
    setBubble(TIPS[Math.floor(Math.random() * TIPS.length)])
    setWaving(true)
    setMood('happy')
    setTimeout(() => setBubble(null), 3500)
    setTimeout(() => { setWaving(false); setMood('idle') }, 900)
  }

  if (!pos) return null
  // signed-in users can switch the floating companion off in My Little Pet
  if (user && pet && !pet.show_companion) return null

  const unlockedNote = newlyUnlocked.length > 0 ? 'new accessories unlocked!' : null
  const activeBubble = bubble ?? unlockedNote ?? (showHint ? 'sama mo ako! ✦' : null)
  const shownMood: PetMood = unlockedNote && mood === 'idle' ? 'excited' : mood

  return (
    <div className="scrappy-companion"
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
        }}>
          {activeBubble}
          {(bubble || unlockedNote) && (
            <Link href={guest ? '/auth/login?next=/pet' : '/pet'} onClick={(e) => e.stopPropagation()}
              style={{ display: 'block', marginTop: 2, fontFamily: 'Verdana, sans-serif', fontSize: 12, fontWeight: 700, color: '#E0007A' }}>
              {guest ? 'log in to dress me up ♡' : 'dress me up ♡'}
            </Link>
          )}
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

      <div style={{ position: 'relative', cursor: dragging ? 'grabbing' : 'grab', transform: waving ? 'translateY(-6px)' : 'none', transition: 'transform .2s' }}>
        <PetAvatar equipped={pet?.equipped ?? {}} size={64} mood={shownMood} title={user ? 'Your Scrappy pet' : 'Scrappy pet'} />
      </div>
    </div>
  )
}
