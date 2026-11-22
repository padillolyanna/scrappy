'use client'

import { useRef, useEffect } from 'react'
import { useSyncExternalStore } from 'react'
import { starterCover, PAGE_W, PAGE_H, type NbPage } from '@/lib/notebook'
import { StaticCover } from '@/components/notebook/Spread'

const NOTEBOOKS = [
  { id: 'pink-princess',    scale: 0.28, depth: 0.05, top: 30,  left: 165, rotate: '-5deg',  duration: '6s',   delay: '0s' },
  { id: 'sweet-memories',   scale: 0.23, depth: 0.04, top: 10,  left: 30,  rotate: '6deg',   duration: '7s',   delay: '0.5s' },
  { id: 'retro-camera',     scale: 0.21, depth: 0.06, top: 170, left: 240, rotate: '-3deg',  duration: '5.5s', delay: '1s' },
  { id: 'glitter-explosion',scale: 0.17, depth: 0.07, top: 145, left: -5,  rotate: '9deg',   duration: '5s',   delay: '0.3s' },
]

let coverCache: Record<string, NbPage> | null = null
function getCovers() {
  coverCache ??= Object.fromEntries(
    NOTEBOOKS.map((n) => [n.id, starterCover(n.id, n.id)])
  )
  return coverCache
}
const noop = () => () => {}

export default function FloatingScrapbooks() {
  const containerRef = useRef<HTMLDivElement>(null)
  const outerRefs = useRef<(HTMLDivElement | null)[]>([])
  const covers = useSyncExternalStore(noop, getCovers, () => null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    let rafId: number
    const handleMouse = (e: MouseEvent) => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const cx = e.clientX / window.innerWidth - 0.5
        const cy = e.clientY / window.innerHeight - 0.5
        NOTEBOOKS.forEach((nb, i) => {
          const el = outerRefs.current[i]
          if (!el) return
          const dx = cx * nb.depth * 120
          const dy = cy * nb.depth * 120
          el.style.transform = `translate(${dx}px, ${dy}px) rotate(${nb.rotate})`
        })
      })
    }

    const obs = new IntersectionObserver(([entry]) => {
      outerRefs.current.forEach((el) => {
        if (!el) return
        const inner = el.firstElementChild as HTMLElement | null
        if (inner) inner.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused'
      })
    }, { threshold: 0.1 })

    if (containerRef.current) obs.observe(containerRef.current)
    window.addEventListener('mousemove', handleMouse, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouse)
      cancelAnimationFrame(rafId)
      obs.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef} className="relative select-none" style={{ height: 380 }}>
      {NOTEBOOKS.map((nb, i) => {
        const W = Math.round(PAGE_W * nb.scale)
        const H = Math.round(PAGE_H * nb.scale)
        return (
          <div
            key={nb.id}
            ref={(el) => { outerRefs.current[i] = el }}
            style={{
              position: 'absolute',
              top: nb.top,
              left: nb.left,
              transform: `rotate(${nb.rotate})`,
              zIndex: i + 1,
              willChange: 'transform',
            }}
          >
            {/* Float animation wrapper — isolates translateY from rotation */}
            <div
              style={{
                animation: `nb-float-y ${nb.duration} ease-in-out infinite`,
                animationDelay: nb.delay,
                width: W,
                height: H,
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '4px 6px 20px rgba(43,10,46,.22)',
              }}
            >
              <div className="relative" style={{ width: W, height: H, overflow: 'hidden' }}>
                <div
                  className="pointer-events-none absolute left-0 top-0 origin-top-left"
                  style={{ transform: `scale(${nb.scale})` }}
                >
                  {covers
                    ? <StaticCover page={covers[nb.id]} />
                    : <div style={{ width: PAGE_W, height: PAGE_H, borderRadius: 18, background: '#f3e3ee' }} />
                  }
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
