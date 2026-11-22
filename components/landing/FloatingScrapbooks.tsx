'use client'

import { useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { HOME_ASSETS } from '@/lib/homeAssets'

const NOTEBOOKS = [
  {
    asset: HOME_ASSETS.nbPink,
    style: { left: '14%', top: 70 },
    width: 230,
    rotate: -9,
    duration: 6,
    delay: 0,
    depth: 0.05,
    priority: true,
  },
  {
    asset: HOME_ASSETS.nbZebra,
    style: { right: '6%', top: 24 },
    width: 190,
    rotate: 10,
    duration: 7,
    delay: 0.5,
    depth: 0.04,
    priority: false,
  },
  {
    asset: HOME_ASSETS.nbHolo,
    style: { right: '12%', bottom: 40 },
    width: 210,
    rotate: 5,
    duration: 5.5,
    delay: 1,
    depth: 0.06,
    priority: false,
  },
  {
    asset: HOME_ASSETS.nbLeopard,
    style: { left: '4%', bottom: 46 },
    width: 150,
    rotate: -14,
    duration: 5,
    delay: 0.3,
    depth: 0.07,
    priority: false,
  },
]

export default function FloatingScrapbooks() {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const rafRef = useRef<number | null>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const targetRef = useRef({ x: 0.5, y: 0.5 })
  const observerRef = useRef<IntersectionObserver | null>(null)
  const activeRef = useRef(true)

  const animate = useCallback(() => {
    if (!activeRef.current) return
    mouseRef.current.x += (targetRef.current.x - mouseRef.current.x) * 0.06
    mouseRef.current.y += (targetRef.current.y - mouseRef.current.y) * 0.06

    NOTEBOOKS.forEach((nb, i) => {
      const el = itemRefs.current[i]
      if (!el) return
      const dx = (mouseRef.current.x - 0.5) * 24 * nb.depth * 10
      const dy = (mouseRef.current.y - 0.5) * 24 * nb.depth * 10
      el.style.transform = `translate(${dx}px, ${dy}px) rotate(${nb.rotate}deg)`
    })

    rafRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    observerRef.current = new IntersectionObserver(([entry]) => {
      activeRef.current = entry.isIntersecting
      if (entry.isIntersecting) rafRef.current = requestAnimationFrame(animate)
      else if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    }, { threshold: 0 })

    if (containerRef.current) observerRef.current.observe(containerRef.current)
    rafRef.current = requestAnimationFrame(animate)

    const isCoarse = window.matchMedia('(pointer: coarse)').matches
    if (!isCoarse) {
      const container = containerRef.current
      const onMove = (e: MouseEvent) => {
        const rect = container?.getBoundingClientRect()
        if (!rect) return
        targetRef.current.x = (e.clientX - rect.left) / rect.width
        targetRef.current.y = (e.clientY - rect.top) / rect.height
      }
      container?.addEventListener('mousemove', onMove)
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        observerRef.current?.disconnect()
        container?.removeEventListener('mousemove', onMove)
      }
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      observerRef.current?.disconnect()
    }
  }, [animate])

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Floating scrapbooks"
      style={{ position: 'relative', height: 560, overflow: 'hidden' }}
    >
      {/* Radial glow behind everything */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: '40px 30px',
          background: 'radial-gradient(closest-side, rgba(255,122,192,.45), rgba(184,140,255,.25) 60%, transparent)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Notebooks */}
      {NOTEBOOKS.map((nb, i) => (
        <div
          key={i}
          ref={(el) => { itemRefs.current[i] = el }}
          className="absolute"
          style={{
            ...nb.style as React.CSSProperties,
            width: nb.width,
            transform: `rotate(${nb.rotate}deg)`,
            zIndex: i + 1,
            willChange: 'transform',
          }}
        >
          <div style={{ animation: `nb-float-y ${nb.duration}s ease-in-out ${nb.delay}s infinite` }}>
            <Link
              href="/scrapbook/create"
              aria-label="Start a scrapbook"
              tabIndex={i === 0 ? 0 : -1}
              style={{
                display: 'block',
                borderRadius: 10,
                overflow: 'hidden',
                boxShadow: '6px 10px 24px rgba(43,10,46,.25)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                const t = e.currentTarget as HTMLElement
                t.style.transform = 'translateY(-8px)'
                t.style.boxShadow = '10px 16px 32px rgba(43,10,46,.35)'
              }}
              onMouseLeave={(e) => {
                const t = e.currentTarget as HTMLElement
                t.style.transform = ''
                t.style.boxShadow = '6px 10px 24px rgba(43,10,46,.25)'
              }}
            >
              <div style={{ position: 'relative', width: nb.width, height: Math.round(nb.width * nb.asset.h / nb.asset.w) }}>
                <Image
                  src={nb.asset.src}
                  alt={nb.asset.alt}
                  fill
                  style={{ objectFit: 'contain' }}
                  priority={nb.priority}
                  sizes={`${nb.width}px`}
                />
              </div>
            </Link>
          </div>
        </div>
      ))}

      {/* Gems */}
      <div
        aria-hidden
        style={{ position: 'absolute', left: '52%', top: 300, width: 44, height: 44, zIndex: 10, animation: 'nb-float-y 4s ease-in-out 0.7s infinite' }}
      >
        <div style={{ position: 'relative', width: 44, height: 44 }}>
          <Image src={HOME_ASSETS.gemHeart.src} alt="" fill style={{ objectFit: 'contain' }} sizes="44px" />
        </div>
      </div>
      <div
        aria-hidden
        style={{ position: 'absolute', left: '46%', top: 10, width: 52, height: 52, zIndex: 10, animation: 'nb-float-y 5s ease-in-out 1.4s infinite' }}
      >
        <div style={{ position: 'relative', width: 52, height: 52 }}>
          <Image src={HOME_ASSETS.gemLilac.src} alt="" fill style={{ objectFit: 'contain' }} sizes="52px" />
        </div>
      </div>

      {/* Washi tape strips */}
      <div
        aria-hidden
        style={{
          position: 'absolute', left: '28%', top: '45%', width: 120, height: 18,
          background: 'repeating-linear-gradient(90deg, rgba(255,243,176,.8) 0px, rgba(255,243,176,.8) 10px, rgba(255,220,100,.5) 10px, rgba(255,220,100,.5) 20px)',
          transform: 'rotate(-15deg)', borderRadius: 4, opacity: 0.75, zIndex: 8, pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute', right: '20%', top: '30%', width: 100, height: 16,
          background: 'repeating-linear-gradient(90deg, rgba(201,162,255,.7) 0px, rgba(201,162,255,.7) 8px, rgba(168,135,220,.4) 8px, rgba(168,135,220,.4) 16px)',
          transform: 'rotate(8deg)', borderRadius: 4, opacity: 0.65, zIndex: 8, pointerEvents: 'none',
        }}
      />
    </div>
  )
}
