'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { HOME_ASSETS } from '@/lib/homeAssets'

const STEPS = [
  { n: '01', label: 'pick a frame' },
  { n: '02', label: 'snap 4 poses' },
  { n: '03', label: 'decorate + save' },
]

// CSS fallback booth if WebP not available
function BoothFallback() {
  return (
    <div style={{ width: 220, background: 'linear-gradient(180deg, #FFB6D9, #C9A2FF)', borderRadius: 24, border: '3px solid var(--ink)', padding: 16, boxShadow: '6px 6px 0 var(--ink)' }}>
      <div style={{ background: '#FF4FA3', borderRadius: 10, padding: '6px 0', textAlign: 'center', marginBottom: 12, border: '2px solid var(--ink)', color: 'white', fontFamily: 'VT323, monospace', fontSize: 18 }}>snap snap!</div>
      <div style={{ background: 'linear-gradient(180deg, #87CEEB, #4a9eff)', borderRadius: 12, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--ink)', marginBottom: 12 }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#1a1a2e', border: '4px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #666, #333)' }} />
        </div>
      </div>
      <div style={{ background: 'repeating-linear-gradient(90deg, #FF4FA3 0px, #FF4FA3 10px, white 10px, white 20px)', height: 40, borderRadius: 8, border: '2px solid var(--ink)' }} />
    </div>
  )
}

export default function PhotoboothSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)

  const boothH = Math.round(340 * HOME_ASSETS.booth.h / HOME_ASSETS.booth.w)
  const stripW = 118
  const stripH = Math.round(stripW * HOME_ASSETS.strip.h / HOME_ASSETS.strip.w)

  return (
    <section
      style={{
        background: 'white',
        borderTop: '3px solid var(--ink)',
        borderBottom: '3px solid var(--ink)',
        padding: '80px 24px',
      }}
      ref={sectionRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ maxWidth: 'var(--content-width)', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}
        className="[grid-template-columns:1fr] sm:[grid-template-columns:1fr_1fr]"
      >
        {/* Left — image */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          {/* Oval shadow under booth */}
          <div style={{ position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)', width: 260, height: 32, background: 'rgba(43,10,46,.18)', borderRadius: '50%', filter: 'blur(10px)', zIndex: 0 }} />

          {/* Booth image */}
          <div style={{ position: 'relative', width: 340, zIndex: 1 }}>
            <Image
              src={HOME_ASSETS.booth.src}
              alt={HOME_ASSETS.booth.alt}
              width={340}
              height={boothH}
              style={{ objectFit: 'contain', display: 'block' }}
              priority={false}
            />

            {/* Strip floating out of the booth's side */}
            <div
              ref={stripRef}
              style={{
                position: 'absolute',
                top: '20%',
                right: -stripW * 0.6,
                width: stripW,
                transform: `rotate(8deg) translateX(${hovered ? 20 : 0}px)`,
                transition: 'transform 0.4s ease',
                zIndex: 2,
                animation: 'nb-float-y 5s ease-in-out 0.3s infinite',
              }}
            >
              <Image
                src={HOME_ASSETS.strip.src}
                alt={HOME_ASSETS.strip.alt}
                width={stripW}
                height={stripH}
                style={{ objectFit: 'contain', display: 'block', borderRadius: 6, boxShadow: '4px 6px 16px rgba(43,10,46,.2)' }}
              />
            </div>
          </div>
        </div>

        {/* Right — copy */}
        <div>
          <div className="font-silkscreen" style={{ fontSize: 15, color: 'var(--pink-text)', marginBottom: 14 }}>
            ✦ THE PHOTOBOOTH
          </div>
          <h2 className="font-pacifico" style={{ fontSize: 'clamp(34px, 4.4vw, 56px)', color: 'var(--ink)', lineHeight: 1.1, marginBottom: 20 }}>
            step inside the purikura machine
          </h2>
          <p className="font-nunito" style={{ fontSize: 19, lineHeight: 1.6, color: 'var(--ink)', opacity: 0.8, marginBottom: 28, maxWidth: 440 }}>
            Pick a frame, strike four poses, then decorate your strip with stamps and gems. Save it to your phone or stick it straight onto a scrapbook page.
          </p>

          {/* Step cards */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
            {STEPS.map((s) => (
              <div
                key={s.n}
                style={{
                  background: 'white',
                  border: '2.5px solid var(--ink)',
                  borderRadius: 16,
                  padding: '12px 16px',
                  flex: '1 1 100px',
                }}
              >
                <div className="font-silkscreen" style={{ fontSize: 11, color: 'var(--pink)', marginBottom: 4 }}>{s.n}</div>
                <div className="font-nunito font-extrabold" style={{ fontSize: 15, color: 'var(--ink)', lineHeight: 1.3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <Link
            href="/photobooth"
            className="font-nunito font-black"
            style={{
              minHeight: 48,
              padding: '0 28px',
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 999,
              border: '3px solid var(--ink)',
              background: 'linear-gradient(to bottom, #B98CFF, var(--purple))',
              color: 'white',
              fontSize: 16,
              textDecoration: 'none',
              boxShadow: 'inset 0 3px 0 rgba(255,255,255,.55), 0 5px 0 var(--ink)',
            }}
          >
            Try the photobooth →
          </Link>
        </div>
      </div>
    </section>
  )
}
