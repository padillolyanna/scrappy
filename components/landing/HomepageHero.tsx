'use client'

import Link from 'next/link'
import FloatingScrapbooks from './FloatingScrapbooks'

export default function HomepageHero() {
  return (
    <section style={{ padding: '80px 24px 56px', maxWidth: 'var(--content-width)', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}
        className="[grid-template-columns:1fr] sm:[grid-template-columns:1fr_1fr]"
      >
        {/* Left — text */}
        <div>
          {/* Yellow tag */}
          <div
            className="font-silkscreen inline-block"
            style={{
              fontSize: 14,
              background: 'var(--yellow)',
              border: '2px solid var(--ink)',
              borderRadius: 6,
              padding: '4px 12px',
              transform: 'rotate(-2deg)',
              marginBottom: 24,
              display: 'inline-block',
              color: 'var(--ink)',
            }}
          >
            a digital scrapbook club ✦ est. 2026
          </div>

          {/* H1 */}
          <h1
            className="font-pacifico"
            style={{
              fontSize: 'clamp(44px, 6vw, 76px)',
              lineHeight: 1.1,
              color: 'var(--ink)',
              marginBottom: 24,
            }}
          >
            your little corner of the{' '}
            <span style={{ color: '#D4006E' }}>internet</span>
          </h1>

          {/* Paragraph */}
          <p
            className="font-nunito"
            style={{
              fontSize: 20,
              lineHeight: 1.6,
              color: 'var(--ink)',
              maxWidth: 520,
              marginBottom: 32,
              opacity: 0.85,
            }}
          >
            Make spiral-bound scrapbooks with stickers, photos and gems. Snap purikura strips in the photobooth. Share them with friends, or keep them for you.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
            <Link
              href="/scrapbook/create"
              className="font-nunito font-black"
              style={{
                minHeight: 54,
                padding: '0 32px',
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: 999,
                border: '3px solid var(--ink)',
                background: 'linear-gradient(to bottom, #FF7AC0, var(--pink))',
                color: 'white',
                fontSize: 18,
                textDecoration: 'none',
                boxShadow: 'inset 0 3px 0 rgba(255,255,255,.55), 0 5px 0 var(--ink)',
                transition: 'transform 0.1s, box-shadow 0.1s',
              }}
              onMouseEnter={(e) => { const t = e.currentTarget as HTMLAnchorElement; t.style.transform = 'translateY(-2px)'; t.style.boxShadow = 'inset 0 3px 0 rgba(255,255,255,.55), 0 7px 0 var(--ink)' }}
              onMouseLeave={(e) => { const t = e.currentTarget as HTMLAnchorElement; t.style.transform = ''; t.style.boxShadow = 'inset 0 3px 0 rgba(255,255,255,.55), 0 5px 0 var(--ink)' }}
            >
              Start a scrapbook
            </Link>
            <Link
              href="/photobooth"
              className="font-nunito font-black"
              style={{
                minHeight: 54,
                padding: '0 32px',
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: 999,
                border: '3px solid var(--ink)',
                background: 'linear-gradient(to bottom, white, #E6E9F2)',
                color: 'var(--ink)',
                fontSize: 18,
                textDecoration: 'none',
                boxShadow: 'inset 0 3px 0 rgba(255,255,255,.55), 0 5px 0 var(--ink)',
                transition: 'transform 0.1s, box-shadow 0.1s',
              }}
              onMouseEnter={(e) => { const t = e.currentTarget as HTMLAnchorElement; t.style.transform = 'translateY(-2px)'; t.style.boxShadow = 'inset 0 3px 0 rgba(255,255,255,.55), 0 7px 0 var(--ink)' }}
              onMouseLeave={(e) => { const t = e.currentTarget as HTMLAnchorElement; t.style.transform = ''; t.style.boxShadow = 'inset 0 3px 0 rgba(255,255,255,.55), 0 5px 0 var(--ink)' }}
            >
              Open the photobooth
            </Link>
          </div>

          <p className="font-nunito" style={{ fontSize: 15, color: 'var(--ink)', opacity: 0.55 }}>
            Free · no download · works on your phone
          </p>
        </div>

        {/* Right — floating cluster */}
        <div style={{ position: 'relative' }} className="hidden sm:block">
          <FloatingScrapbooks />
        </div>
      </div>
    </section>
  )
}
