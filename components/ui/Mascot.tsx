'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import PetAvatar from '@/components/pet/PetAvatar'
import { usePet } from '@/lib/pet/usePet'

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

  // Ref tracks drag state synchronously — avoids stale-closure bug where
  // handlePointerMove reads an outdated `dragging = false` before re-render.
  const draggingRef = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const didDrag = useRef(false)
  const posRef = useRef<{ x: number; y: number } | null>(null)

  const { pet, guest, loading } = usePet({ claim: 'session' })

  // Only authenticated users who have the companion enabled can drag/see the pet.
  const canDrag = !loading && !guest
  // Guests see a default view-only pet. Logged-in users see it unless they disabled it.
  const isVisible = loading || guest || pet?.show_companion !== false

  function clamp(x: number, y: number) {
    return {
      x: Math.max(0, Math.min(x, window.innerWidth - 110)),
      y: Math.max(0, Math.min(y, window.innerHeight - 130)),
    }
  }

  function moveTo(x: number, y: number) {
    const p = clamp(x, y)
    posRef.current = p
    setPos(p)
  }

  useEffect(() => {
    const saved = localStorage.getItem('mascot-pos-v2')
    if (saved) {
      try {
        const p = JSON.parse(saved) as { x: number; y: number }
        moveTo(p.x, p.y)
      } catch {
        moveTo(window.innerWidth - 90, window.innerHeight - 160)
      }
    } else {
      moveTo(window.innerWidth - 90, window.innerHeight - 160)
    }

    if (!localStorage.getItem('mascot-hint')) {
      const t1 = setTimeout(() => setShowHint(true), 800)
      const t2 = setTimeout(() => {
        setShowHint(false)
        localStorage.setItem('mascot-hint', '1')
      }, 4500)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handlePointerDown(e: React.PointerEvent) {
    if (!canDrag || !posRef.current) return
    e.preventDefault()
    // Capture on currentTarget (the outer div) so move/up events route correctly.
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    dragOffset.current = {
      x: e.clientX - posRef.current.x,
      y: e.clientY - posRef.current.y,
    }
    didDrag.current = false
    // Update ref first (synchronous) so handlePointerMove sees it immediately.
    draggingRef.current = true
    setDragging(true)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return
    e.preventDefault()
    didDrag.current = true
    moveTo(e.clientX - dragOffset.current.x, e.clientY - dragOffset.current.y)
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!draggingRef.current) return
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    draggingRef.current = false
    setDragging(false)
    if (posRef.current) localStorage.setItem('mascot-pos-v2', JSON.stringify(posRef.current))
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

  if (!pos || !isVisible) return null

  const activeBubble = bubble ?? (showHint && canDrag ? 'sama mo ako! ✦' : null)

  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        zIndex: 9999,
        userSelect: 'none',
        touchAction: 'none',
        cursor: canDrag ? (dragging ? 'grabbing' : 'grab') : 'default',
      }}
      onPointerDown={canDrag ? handlePointerDown : undefined}
      onPointerMove={canDrag ? handlePointerMove : undefined}
      onPointerUp={canDrag ? handlePointerUp : undefined}
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

      {showHint && canDrag && (
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

      <div className="animate-mascot-idle" style={{ pointerEvents: 'none' }}>
        <PetAvatar
          equipped={pet?.equipped ?? {}}
          size={90}
          mood={waving ? 'excited' : 'idle'}
          animated={false}
          title=""
        />
      </div>
    </div>,
    document.body
  )
}
