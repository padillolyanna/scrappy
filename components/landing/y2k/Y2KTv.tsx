'use client'

import { useEffect, useState, useSyncExternalStore, type CSSProperties } from 'react'
import Link from 'next/link'
import { assetThumb } from '@/lib/assetLibrary'

/* SCRAPPY TV: a little looping "broadcast" drawn in CSS.
   It opens with a CRT power-on + SCRAPPY title card, then plays scenes that each
   move in their own way (a desktop being clicked around, a photobooth, an IM chat,
   a music player, a teletext page) so the loop never feels like the same trick. */

type SceneId = 'intro' | 'desktop' | 'booth' | 'chat' | 'music' | 'text'

const SCENES: { id: SceneId; name: string; href: string; label: string; ms: number }[] = [
  { id: 'intro', name: 'SCRAPPY', href: '/scrapbook/create', label: 'Start a scrapbook', ms: 6200 },
  { id: 'desktop', name: 'MY DIARY', href: '/scrapbook/create', label: 'Open the scrapbook maker', ms: 7600 },
  { id: 'booth', name: 'PHOTOBOOTH', href: '/photobooth', label: 'Open the photobooth', ms: 6200 },
  { id: 'chat', name: 'BUDDY CHAT', href: '/hangouts', label: 'See journal hangouts', ms: 7000 },
  { id: 'music', name: 'NOW PLAYING', href: '/explore', label: 'Explore scrapbooks', ms: 6000 },
  { id: 'text', name: 'SCRAPPYTEXT', href: '/prompts', label: "Answer today's prompt", ms: 6800 },
]

function subscribeReduced(cb: () => void) {
  const m = window.matchMedia('(prefers-reduced-motion: reduce)')
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}
const getReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// eslint-disable-next-line @next/next/no-img-element
const Px = ({ id, size, style, className }: { id: string; size: number; style?: CSSProperties; className?: string }) => <img src={assetThumb(id)} alt="" width={size} height={size} draggable={false} className={className} style={{ width: size, height: size, objectFit: 'contain', ...style }} />

const d = (s: number) => ({ animationDelay: `${s}s` }) as CSSProperties

/* ── 0 · title intro ── */
const LOGO_COLORS = ['#FF4FA3', '#FFE14D', '#7CE0FF', '#B07CFF', '#8CE6B0', '#FF8C42', '#FF4FA3']
function Intro() {
  return (
    <div className="tvi">
      <div className="tvi-bg" />
      <div className="tvi-rays" />
      <div className="tvi-logo">
        {'SCRAPPY'.split('').map((l, i) => (
          <span key={i} style={{ '--i': i, '--c': LOGO_COLORS[i] } as CSSProperties}>{l}</span>
        ))}
        <em>.fun</em>
      </div>
      <div className="tvi-tag"><span>your little corner of the internet</span></div>
      <span className="tvi-start">▶ PRESS START</span>
      {[[14, 18, 2.3], [84, 14, 2.6], [8, 70, 2.9], [90, 66, 3.1], [30, 86, 3.4], [70, 88, 3.7]].map(([x, y, t], i) => (
        <i key={i} className="tvi-spark" style={{ left: `${x}%`, top: `${y}%`, ...d(t) }}>✦</i>
      ))}
      <div className="tvi-power" />
    </div>
  )
}

/* ── 1 · a pink desktop: cursor double-clicks my_diary.exe ── */
function Desktop() {
  return (
    <div className="tvk">
      <div className="tvk-icons">
        <span className="tvk-ico tvk-ico--hit"><Px id="y2k-computer" size={34} /><b>my_diary.exe</b></span>
        <span className="tvk-ico"><Px id="y2k-camera" size={34} /><b>photobooth</b></span>
        <span className="tvk-ico"><Px id="gem-heart" size={34} /><b>stickers</b></span>
      </div>
      <div className="tvk-win">
        <div className="tvk-ttl">my_diary.exe <span>_ □ ×</span></div>
        <div className="tvk-load"><b>loading memories…</b><i><s /></i></div>
        <div className="tvk-page">
          <p>dear diary,<br />today i made<br />my first scrapbook!!</p>
          <Px id="mat-polaroid" size={44} className="tvk-pop" style={{ right: 10, top: 8, rotate: '8deg', ...d(4.9) }} />
          <Px id="cute-star" size={28} className="tvk-pop" style={{ right: 52, bottom: 8, ...d(5.3) }} />
          <Px id="charm-bow" size={30} className="tvk-pop" style={{ left: 8, bottom: 6, ...d(5.6) }} />
        </div>
      </div>
      <div className="tvk-bar"><span>★ start</span><em>12:04 AM</em></div>
      <svg className="tvk-cursor" width="18" height="24" viewBox="0 0 12 16" aria-hidden="true" shapeRendering="crispEdges">
        <path d="M0 0v13l3-3 2 5 2-1-2-5h4z" fill="#fff" stroke="#000" strokeWidth="1" />
      </svg>
    </div>
  )
}

/* ── 2 · photobooth: countdown, flashes, strip prints ── */
function Booth() {
  return (
    <div className="tvb">
      <div className="tvb-cam" aria-hidden="true">
        <div className="tvb-cam-head">snap snap!</div>
        <div className="tvb-lens"><i /></div>
        <div className="tvb-curtain" />
      </div>
      <div className="tvb-strip">
        {['cute-bunny', 'cute-kitten', 'cute-star'].map((id, i) => (
          <div key={id} className="tvb-frame" style={d(1.9 + i * 0.75)}>
            <Px id={id} size={42} />
          </div>
        ))}
        <span>bff 4ever</span>
      </div>
      <div className="tvb-count"><b>3</b><b>2</b><b>1</b></div>
      <div className="tvb-flash" />
    </div>
  )
}

/* ── 3 · buddy chat window ── */
const CHAT: { who: 'them' | 'me'; text: string; at: number }[] = [
  { who: 'them', text: 'did u see my new scrapbook??', at: 1.4 },
  { who: 'me', text: 'omg the glitter cover!!! ♡', at: 2.6 },
  { who: 'them', text: 'photobooth strip l8r? ✿', at: 3.9 },
  { who: 'me', text: 'yesss brb decorating ✦', at: 5.1 },
]
function Chat() {
  return (
    <div className="tvc">
      <div className="tvc-win">
        <div className="tvc-ttl">sk8rgrl04 — Instant Message <span>_ □ ×</span></div>
        <div className="tvc-signon"><Px id="charm-padlock" size={18} /> sk8rgrl04 has signed on</div>
        <div className="tvc-log">
          {CHAT.map((m, i) => (
            <p key={i} className={`tvc-msg tvc-msg--${m.who}`} style={d(m.at)}>
              <b>{m.who === 'them' ? 'sk8rgrl04' : 'xoxo_scrappy'}:</b> {m.text}
            </p>
          ))}
          <p className="tvc-typing" style={d(0.7)}>sk8rgrl04 is typing<span>...</span></p>
        </div>
        <div className="tvc-input"><span className="tvc-caret" /> <em>Send</em></div>
      </div>
      <Px id="gem-heart" size={40} className="tvc-heart" style={d(5.8)} />
    </div>
  )
}

/* ── 4 · now playing: mini mp3 player + visualizer ── */
function Music() {
  return (
    <div className="tvm">
      <div className="tvm-sun" />
      <div className="tvm-player">
        <div className="tvm-lcd">
          <div className="tvm-marquee"><span>♪ scrappy.fun — dial-up love song (glitter mix) ♪ &nbsp; ♪ scrappy.fun — dial-up love song (glitter mix) ♪ &nbsp;</span></div>
          <div className="tvm-row"><b className="tvm-time">00:0<i /></b><span>128kbps · 44kHz · stereo</span></div>
          <div className="tvm-viz">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ animationDelay: `${(i * 37) % 9 / 10}s`, animationDuration: `${0.45 + ((i * 13) % 5) / 10}s` }} />)}</div>
        </div>
        <div className="tvm-btns"><i>◀◀</i><i>▶</i><i>❚❚</i><i>▶▶</i></div>
      </div>
      <Px id="cute-star" size={34} className="tvm-bop" style={{ left: '8%', top: '14%' }} />
      <Px id="charm-cherry" size={34} className="tvm-bop" style={{ right: '8%', top: '12%', ...d(0.25) }} />
      <Px id="y2k-cd" size={36} className="tvm-spin" style={{ left: '7%', bottom: '12%' }} />
      <Px id="gem-heart" size={30} className="tvm-bop" style={{ right: '9%', bottom: '14%', ...d(0.5) }} />
    </div>
  )
}

/* ── 5 · teletext "today on scrappy" ── */
const TT = [
  ['DAILY PROMPT', '101', '#FFE14D'],
  ['JOURNAL HANGOUTS', '102', '#7CE0FF'],
  ['PHOTOBOOTH', '103', '#8CE6B0'],
  ['NEW: PIXEL STICKERS', '104', '#FF8CC8'],
  ['MY LITTLE PET', '105', '#B07CFF'],
]
function Teletext() {
  return (
    <div className="tvt">
      <div className="tvt-head"><span>P100</span><b>SCRAPPYTEXT</b><span className="tvt-clock">24 NOV 00:04</span></div>
      <div className="tvt-banner"><span>TODAY ON SCRAPPY</span></div>
      <ul>
        {TT.map(([t, p, c], i) => (
          <li key={t} style={{ color: c, ...d(0.9 + i * 0.45) }}><span>■ {t}</span><i /><b>{p}</b></li>
        ))}
      </ul>
      <div className="tvt-keys"><i /><i /><i /><i /></div>
    </div>
  )
}

export default function Y2KTv() {
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, () => false)
  const [ch, setCh] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const [flip, setFlip] = useState(0) // bumps on every channel change to replay the static
  const playing = !userPaused && !reduced
  const cur = SCENES[ch]

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => { setCh((c) => (c + 1) % SCENES.length); setFlip((f) => f + 1) }, cur.ms)
    return () => clearTimeout(t)
  }, [playing, ch, cur.ms])

  const go = (step: number) => { setCh((c) => (c + step + SCENES.length) % SCENES.length); setFlip((f) => f + 1) }

  return (
    <div className="y2kh-tv">
      <div className="y2kh-tv-top">
        <span className="y2kh-tv-label">SCRAPPY TV</span>
        <span className="y2kh-tv-ch" aria-live="polite">CH {ch} · {cur.name}</span>
      </div>
      <Link href={cur.href} className={`y2kh-tv-screen ${(reduced || userPaused) ? 'tv-still' : ''}`} aria-label={cur.label}>
        <div key={`${cur.id}-${flip}`} className="tv-channel" aria-hidden="true">
          {cur.id === 'intro' && <Intro />}
          {cur.id === 'desktop' && <Desktop />}
          {cur.id === 'booth' && <Booth />}
          {cur.id === 'chat' && <Chat />}
          {cur.id === 'music' && <Music />}
          {cur.id === 'text' && <Teletext />}
        </div>
        {cur.id !== 'intro' && <span key={`o${flip}`} className="tv-osd" aria-hidden="true">CH{ch}</span>}
        <span className="tv-scan" aria-hidden="true" />
        <span className="tv-vignette" aria-hidden="true" />
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
