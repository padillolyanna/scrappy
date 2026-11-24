'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import FloatingScrapbooks from '@/components/landing/FloatingScrapbooks'
import { assetThumb } from '@/lib/assetLibrary'
import CoverThumb from './CoverThumb'

/* SCRAPPY TV: little looping "channels" drawn in CSS, flipped like an old TV. */

const CHANNELS = [
  { id: 'journal', name: 'JOURNAL', href: '/scrapbook/create', label: 'Open the scrapbook maker' },
  { id: 'booth', name: 'PHOTOBOOTH', href: '/photobooth', label: 'Open the photobooth' },
  { id: 'decorate', name: 'STICKERS', href: '/scrapbook/create', label: 'Decorate a page' },
  { id: 'float', name: 'COVERS', href: '/scrapbook/create', label: 'Pick a cover' },
] as const

const HOLD_MS = 6500

function subscribeReduced(cb: () => void) {
  const m = window.matchMedia('(prefers-reduced-motion: reduce)')
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}
const getReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// eslint-disable-next-line @next/next/no-img-element
const Sticker = ({ id, size, style, className }: { id: string; size: number; style?: React.CSSProperties; className?: string }) => <img src={assetThumb(id)} alt="" width={size} height={size} draggable={false} className={className} style={{ width: size, height: size, objectFit: 'contain', ...style }} />

function JournalChannel() {
  return (
    <div className="tvj">
      <div className="tvj-book">
        <div className="tvj-right">
          <p className="tvj-hand">dear diary…<br />today was the<br />best day ever!!</p>
          <Sticker id="gem-heart" size={34} className="tvj-pop" style={{ left: 74, top: 104, animationDelay: '2.6s' }} />
          <Sticker id="charm-bow" size={36} className="tvj-pop" style={{ left: 14, top: 118, animationDelay: '3s' }} />
          <Sticker id="cute-star" size={32} className="tvj-pop" style={{ left: 88, top: 132, animationDelay: '3.4s' }} />
        </div>
        <div className="tvj-cover">
          <div className="tvj-front"><CoverThumb coverId="pink-princess" title="my diary" scale={0.27} /></div>
          <div className="tvj-back">
            <Sticker id="mat-polaroid" size={70} style={{ position: 'absolute', left: 26, top: 22, rotate: '-6deg' }} />
            <Sticker id="mat-washi" size={60} style={{ position: 'absolute', left: 36, top: 104, rotate: '8deg' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function BoothChannel() {
  return (
    <div className="tvb">
      <div className="tvb-cam" aria-hidden="true">
        <div className="tvb-cam-head">snap snap!</div>
        <div className="tvb-lens"><i /></div>
        <div className="tvb-curtain" />
      </div>
      <div className="tvb-strip">
        {['cute-bunny', 'cute-kitten', 'cute-star'].map((id, i) => (
          <div key={id} className="tvb-frame" style={{ animationDelay: `${1.9 + i * 0.75}s` }}>
            <Sticker id={id} size={46} />
          </div>
        ))}
        <span>bff 4ever</span>
      </div>
      <div className="tvb-count"><b>3</b><b>2</b><b>1</b></div>
      <div className="tvb-flash" />
    </div>
  )
}

const DECOR = [
  { id: 'gem-heart', x: 18, y: 18, r: -12, d: 0.3 },
  { id: 'y2k-flip', x: 170, y: 26, r: 10, d: 0.9 },
  { id: 'cute-strawberry', x: 92, y: 98, r: -4, d: 1.5 },
  { id: 'charm-cherry', x: 22, y: 140, r: 8, d: 2.1 },
  { id: 'y2k-cd', x: 186, y: 132, r: -10, d: 2.7 },
  { id: 'cute-daisy', x: 120, y: 8, r: 14, d: 3.3 },
]

function DecorateChannel() {
  return (
    <div className="tvd">
      <div className="tvd-tape" />
      {DECOR.map((s) => (
        <Sticker key={s.id} id={s.id} size={58} className="tvd-pop" style={{ left: s.x, top: s.y, rotate: `${s.r}deg`, animationDelay: `${s.d}s` }} />
      ))}
      <p className="tvd-xo">xoxo ♡</p>
    </div>
  )
}

export default function Y2KTv() {
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, () => false)
  const [ch, setCh] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const [flip, setFlip] = useState(0) // bumps on every channel change to replay the static
  const playing = !userPaused && !reduced

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => { setCh((c) => (c + 1) % CHANNELS.length); setFlip((f) => f + 1) }, HOLD_MS)
    return () => clearTimeout(t)
  }, [playing, ch])

  const go = (d: number) => { setCh((c) => (c + d + CHANNELS.length) % CHANNELS.length); setFlip((f) => f + 1) }
  const cur = CHANNELS[ch]

  return (
    <div className="y2kh-tv">
      <div className="y2kh-tv-top">
        <span className="y2kh-tv-label">SCRAPPY TV</span>
        <span className="y2kh-tv-ch" aria-live="polite">CH {ch + 1} · {cur.name}</span>
      </div>
      <Link href={cur.href} className={`y2kh-tv-screen ${reduced ? 'tv-still' : ''}`} aria-label={cur.label}>
        <div key={`${cur.id}-${flip}`} className="tv-channel" aria-hidden="true">
          {cur.id === 'journal' && <JournalChannel />}
          {cur.id === 'booth' && <BoothChannel />}
          {cur.id === 'decorate' && <DecorateChannel />}
          {cur.id === 'float' && <div className="tvf"><FloatingScrapbooks compact /></div>}
        </div>
        <span className="tv-osd" aria-hidden="true">CH{ch + 1}</span>
        <span className="tv-scan" aria-hidden="true" />
        {flip > 0 && !reduced && <span key={`s${flip}`} className="tv-static" aria-hidden="true" />}
      </Link>
      <div className="y2kh-tv-ctrls">
        <span className="y2kh-tv-btns">
          <button type="button" onClick={() => go(-1)} aria-label="Previous channel">◀◀</button>
          <button type="button" onClick={() => setUserPaused((p) => !p)} aria-label={playing ? 'Pause channels' : 'Play channels'} aria-pressed={!playing}>{playing ? '❚❚' : '▶'}</button>
          <button type="button" onClick={() => go(1)} aria-label="Next channel">▶▶</button>
        </span>
        <span className={`y2kh-tv-eq ${playing ? 'is-on' : ''}`} aria-hidden="true"><i /><i /><i /><i /><i /></span>
      </div>
    </div>
  )
}
