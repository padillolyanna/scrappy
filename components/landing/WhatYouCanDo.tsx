'use client'

import Link from 'next/link'
import Image from 'next/image'
import { HOME_ASSETS } from '@/lib/homeAssets'

const FEATURES = [
  {
    title: 'Make a scrapbook',
    desc: 'Spiral notebooks with real covers, stickers, gems, tape and your own photos.',
    href: '/scrapbook/create',
    bg: 'var(--pink-soft)',
    icon: HOME_ASSETS.nbPink,
    iconW: 90,
    fallbackEmoji: '📒',
  },
  {
    title: 'Snap a purikura',
    desc: 'Four-pose strips with frames, backgrounds and magazine covers.',
    href: '/photobooth',
    bg: 'var(--purple-soft)',
    icon: HOME_ASSETS.booth,
    iconW: 70,
    fallbackEmoji: '📸',
  },
  {
    title: 'Customize your space',
    desc: 'A profile page you can theme like it\'s 2005: backgrounds, colours, blurbs.',
    href: '/my-space',
    bg: 'var(--blue-soft)',
    icon: null,
    iconW: 70,
    fallbackEmoji: '✨',
  },
  {
    title: 'Swap with friends',
    desc: 'Answer daily prompts and trade pages in the scrapbook exchange.',
    href: '/exchange',
    bg: 'var(--yellow)',
    icon: null,
    iconW: 70,
    fallbackEmoji: '✉️',
  },
]

export default function WhatYouCanDo() {
  return (
    <section
      style={{
        background: 'white',
        borderTop: '3px solid var(--ink)',
        borderBottom: '3px solid var(--ink)',
        padding: '80px 24px',
      }}
    >
      <div style={{ maxWidth: 'var(--content-width)', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 className="font-pacifico" style={{ fontSize: 'clamp(34px, 4.4vw, 56px)', color: 'var(--ink)', lineHeight: 1.1, marginBottom: 12 }}>
            what you can do here
          </h2>
          <p className="font-nunito" style={{ fontSize: 18, color: 'var(--ink)', opacity: 0.65, maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
            Four things, all free, all made to feel like the internet used to.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              style={{
                display: 'block',
                textDecoration: 'none',
                background: 'white',
                border: '2.5px solid var(--ink)',
                borderRadius: 20,
                boxShadow: '4px 6px 0 var(--ink)',
                overflow: 'hidden',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => { const t = e.currentTarget as HTMLElement; t.style.transform = 'translateY(-4px)'; t.style.boxShadow = '4px 10px 0 var(--ink)' }}
              onMouseLeave={(e) => { const t = e.currentTarget as HTMLElement; t.style.transform = ''; t.style.boxShadow = '4px 6px 0 var(--ink)' }}
            >
              {/* Icon area */}
              <div style={{ height: 130, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '2.5px solid var(--ink)' }}>
                {f.icon ? (
                  <div style={{ position: 'relative', width: f.iconW, height: Math.round(f.iconW * f.icon.h / f.icon.w) }}>
                    <Image src={f.icon.src} alt="" fill style={{ objectFit: 'contain' }} sizes={`${f.iconW}px`} />
                  </div>
                ) : (
                  <span style={{ fontSize: 56 }}>{f.fallbackEmoji}</span>
                )}
              </div>
              {/* Text */}
              <div style={{ padding: '18px 20px 20px' }}>
                <h3 className="font-nunito font-black" style={{ fontSize: 22, color: 'var(--ink)', marginBottom: 8, lineHeight: 1.2 }}>
                  {f.title}
                </h3>
                <p className="font-nunito" style={{ fontSize: 16, color: 'var(--ink)', opacity: 0.7, lineHeight: 1.5, margin: 0 }}>
                  {f.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
