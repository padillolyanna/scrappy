'use client'

import { useRef, useEffect, useState, useSyncExternalStore } from 'react'
import { starterCover, PAGE_W, PAGE_H, type NbPage } from '@/lib/notebook'
import { StaticCover } from '@/components/notebook/Spread'
import { assetThumb } from '@/lib/assetLibrary'

/** Design size of the cluster. It is drawn at this size and scaled to fit its column. */
const STAGE_W = 520
const STAGE_H = 460
const STAGE_H_COMPACT = 410

type Book = { id: string; title: string; scale: number; depth: number; x: number; y: number; rotate: number; duration: number; delay: number; z: number; compact?: boolean }
const BOOKS: Book[] = [
  { id: 'sweet-memories',    title: 'sweet memories',    scale: 0.27, depth: 0.04, x: 40,  y: 30,  rotate: -7, duration: 7,   delay: 0.5, z: 1, compact: true },
  { id: 'pink-princess',     title: 'pink princess',     scale: 0.36, depth: 0.03, x: 178, y: 46,  rotate: 4,  duration: 6,   delay: 0,   z: 3, compact: true },
  { id: 'retro-camera',      title: 'retro camera',      scale: 0.25, depth: 0.06, x: 352, y: 232, rotate: 8,  duration: 5.5, delay: 1,   z: 4, compact: true },
  { id: 'glitter-explosion', title: 'glitter explosion', scale: 0.21, depth: 0.07, x: 18,  y: 268, rotate: -11, duration: 5,  delay: 0.3, z: 2 },
]

// a few stickers from the object shelf drifting around the notebooks
const STICKERS = [
  { id: 'gem-heart',   size: 58, x: 140, y: 12,  rotate: -12, duration: 4.5, delay: 0.2 },
  { id: 'cute-star',   size: 64, x: 440, y: 40,  rotate: 10,  duration: 5.2, delay: 0.8 },
  { id: 'y2k-flip',    size: 62, x: 200, y: 360, rotate: -8,  duration: 6.1, delay: 0.4 },
  { id: 'charm-bow',   size: 60, x: 452, y: 168, rotate: 14,  duration: 4.8, delay: 1.2 },
]

let coverCache: Record<string, NbPage> | null = null
function getCovers() {
  coverCache ??= Object.fromEntries(BOOKS.map((b) => [b.id, starterCover(b.id, b.title)]))
  return coverCache
}
const noop = () => () => {}

export default function FloatingScrapbooks({ compact = false }: { compact?: boolean }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const layerRefs = useRef<(HTMLDivElement | null)[]>([])
  const covers = useSyncExternalStore(noop, getCovers, () => null)
  const [fit, setFit] = useState(1)

  const books = compact ? BOOKS.filter((b) => b.compact) : BOOKS
  const stickers = compact ? STICKERS.slice(0, 2) : STICKERS

  // scale the fixed-size stage to the column width
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setFit(Math.min(1.15, entry.contentRect.width / STAGE_W)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // gentle mouse parallax (desktop only) + pause when off-screen
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(pointer: fine)').matches
    const obs = new IntersectionObserver(([entry]) => {
      el.querySelectorAll<HTMLElement>('[data-float]').forEach((f) => {
        f.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused'
      })
    }, { threshold: 0.05 })
    obs.observe(el)
    if (reduced || !fine) return () => obs.disconnect()

    let raf = 0
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const cx = e.clientX / window.innerWidth - 0.5
        const cy = e.clientY / window.innerHeight - 0.5
        layerRefs.current.forEach((layer) => {
          if (!layer) return
          const depth = Number(layer.dataset.depth ?? 0.05)
          layer.style.translate = `${cx * depth * 140}px ${cy * depth * 140}px`
        })
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); obs.disconnect() }
  }, [])

  let li = 0
  return (
    <div ref={boxRef} className="relative w-full select-none" style={{ height: (compact ? STAGE_H_COMPACT : STAGE_H) * fit }} aria-hidden="true">
      {/* soft glow behind the cluster */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(closest-side, rgba(255,122,192,.30), rgba(184,140,255,.16) 60%, transparent)' }} />
      <div className="absolute left-1/2 top-0" style={{ width: STAGE_W, height: STAGE_H, transform: `translateX(-50%) scale(${fit})`, transformOrigin: 'top center' }}>
        {books.map((b) => {
          const W = Math.round(PAGE_W * b.scale)
          const H = Math.round(PAGE_H * b.scale)
          const idx = li++
          return (
            <div key={b.id} ref={(el) => { layerRefs.current[idx] = el }} data-depth={b.depth}
              style={{ position: 'absolute', left: b.x, top: b.y, zIndex: b.z, transition: 'translate .25s ease-out' }}>
              <div style={{ rotate: `${b.rotate}deg` }}>
                <div data-float style={{ animation: `nb-float-y ${b.duration}s ease-in-out ${b.delay}s infinite`, width: W, height: H, filter: 'drop-shadow(6px 10px 0 rgba(43,10,46,.16))' }}>
                  <div className="pointer-events-none origin-top-left" style={{ transform: `scale(${b.scale})` }}>
                    {covers
                      ? <StaticCover page={covers[b.id]} />
                      : <div style={{ width: PAGE_W, height: PAGE_H, borderRadius: 18, background: '#f3e3ee' }} />}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {stickers.map((s) => {
          const idx = li++
          return (
            <div key={s.id} ref={(el) => { layerRefs.current[idx] = el }} data-depth={0.09}
              style={{ position: 'absolute', left: compact ? Math.min(s.x, STAGE_W - s.size) : s.x, top: s.y, zIndex: 6, transition: 'translate .25s ease-out' }}>
              <div style={{ rotate: `${s.rotate}deg` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img data-float src={assetThumb(s.id)} alt="" width={s.size} height={s.size} draggable={false}
                  style={{ width: s.size, height: s.size, objectFit: 'contain', animation: `nb-float-y ${s.duration}s ease-in-out ${s.delay}s infinite`, filter: 'drop-shadow(3px 4px 0 rgba(43,10,46,.18))' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
