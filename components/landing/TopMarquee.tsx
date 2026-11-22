'use client'

import { useState } from 'react'

const TEXT = '✦ make memories ✦ decorate your pages ✦ snap a purikura strip ✦ collect answers ✦ leave a little piece of yourself ✦ '
const DOUBLED = TEXT + TEXT

export default function TopMarquee() {
  const [paused, setPaused] = useState(false)

  return (
    <div
      style={{
        background: '#2B0A2E',
        overflow: 'hidden',
        padding: '8px 0',
        borderTop: '3px solid var(--ink)',
        borderBottom: '3px solid var(--ink)',
        display: 'flex',
        alignItems: 'center',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div style={{ flex: 1, overflow: 'hidden' }} aria-hidden="true">
        <div
          style={{
            display: 'flex',
            whiteSpace: 'nowrap',
            animation: paused ? 'none' : 'marquee 40s linear infinite',
          }}
        >
          <span
            className="font-silkscreen"
            style={{ fontSize: 15, color: 'var(--pink-soft, #FFE9F4)', letterSpacing: '0.04em', display: 'inline-block' }}
          >
            {DOUBLED}
          </span>
          <span
            className="font-silkscreen"
            style={{ fontSize: 15, color: 'var(--pink-soft, #FFE9F4)', letterSpacing: '0.04em', display: 'inline-block' }}
          >
            {DOUBLED}
          </span>
        </div>
      </div>
    </div>
  )
}
