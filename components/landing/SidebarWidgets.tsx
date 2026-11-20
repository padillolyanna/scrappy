'use client'

import { useState, useEffect } from 'react'
import ThemeSwitcher from '@/components/ui/ThemeSwitcher'

// ─── Recent Messages ─────────────────────────────────────────────
const MESSAGES = [
  { user: 'stargazer', color: '#FF4FA3', text: 'omg the daily prompt today is so good!! loving it ✦' },
  { user: 'neonlilacdream', color: '#7C4DDB', text: 'just finished my cyber dreams scrapbook ✦' },
  { user: 'analogdiary', color: '#FF6B00', text: 'the confession wall is so relatable i cried lol' },
  { user: 'glittergirl', color: '#6FE3FF', text: 'can we get more templates pleaseee!' },
  { user: 'vintagevibes', color: '#28C840', text: 'scrapbook exchange matched me with @sunflower99!!' },
]

// ─── Who's Online ─────────────────────────────────────────────────
const ONLINE_USERS = [
  { name: 'stargrl', color: '#FFB6D9' },
  { name: 'neonlila', color: '#C9A2FF' },
  { name: 'analg', color: '#FFF0A8' },
  { name: 'glitter', color: '#A8DFFF' },
  { name: 'vintg', color: '#FFD6EC' },
  { name: 'dreamy', color: '#E8D6FF' },
  { name: 'sunflwr', color: '#B6FFD9' },
  { name: 'indie404', color: '#FFB899' },
  { name: 'melodyxo', color: '#D6EDFF' },
]

// ─── Countdown Timer ──────────────────────────────────────────────
function MidnightCountdown() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 })

  useEffect(() => {
    function calc() {
      const now = new Date()
      const tomorrow = new Date()
      tomorrow.setHours(24, 0, 0, 0)
      const diff = tomorrow.getTime() - now.getTime()
      return {
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      }
    }
    setTime(calc())
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div style={{ fontFamily: "'Silkscreen', monospace", fontSize: 18, color: '#00ff41', background: '#0a0a0a', padding: '4px 8px', borderRadius: 4, letterSpacing: '0.08em', display: 'inline-block', border: '1px solid #333' }}>
      {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
    </div>
  )
}

// ─── Hit Counter ──────────────────────────────────────────────────
function HitCounter() {
  const digits = '048291'.split('')
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {digits.map((d, i) => (
        <span key={i} className="counter-digit">{d}</span>
      ))}
    </div>
  )
}

// ─── Winamp-style Now Playing ─────────────────────────────────────
function NowPlaying() {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #bfbdb5, #d4d0c8)',
      border: '2px solid',
      borderColor: '#ffffff #808080 #808080 #ffffff',
      padding: '5px 7px',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    }}>
      {/* Play button */}
      <button
        style={{
          width: 20, height: 20,
          background: 'linear-gradient(180deg, #d4d0c8, #bfbdb5)',
          border: '1px solid',
          borderColor: '#ffffff #808080 #808080 #ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, cursor: 'pointer', flexShrink: 0,
        }}
        aria-label="Play"
      >
        ▶
      </button>

      {/* Scrolling song title */}
      <div style={{ overflow: 'hidden', flex: 1, background: '#000', border: '1px inset #333', padding: '1px 3px' }}>
        <div style={{
          fontFamily: "'Silkscreen', monospace",
          fontSize: 10,
          color: '#00ff41',
          whiteSpace: 'nowrap',
          animation: 'ticker 10s linear infinite',
        }}>
          ♪ Toxic – Britney Spears &nbsp;&nbsp;&nbsp; ♪ Toxic – Britney Spears &nbsp;&nbsp;&nbsp;
        </div>
      </div>
    </div>
  )
}

// ─── Widget wrapper ───────────────────────────────────────────────
function Widget({ header, children }: { header: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="panel-header">{header}</div>
      <div className="widget-box" style={{ padding: '8px 10px' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Main sidebar ─────────────────────────────────────────────────
export default function SidebarWidgets() {
  return (
    <div className="flex flex-col gap-3">

      {/* Recent messages */}
      <Widget header="✦ recent messages!">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {MESSAGES.map((m, i) => (
            <div key={i} style={{ fontFamily: 'Verdana, Tahoma, sans-serif', fontSize: 11, lineHeight: 1.4 }}>
              <span style={{ color: m.color, fontWeight: 'bold' }}>{m.user}:</span>{' '}
              <span style={{ color: '#3A0030' }} className="line-clamp-1">{m.text}</span>
              {i === MESSAGES.length - 1 && (
                <span className="animate-blink" style={{ marginLeft: 1, color: '#FF4FA3' }}>|</span>
              )}
            </div>
          ))}
        </div>
      </Widget>

      {/* Who's online */}
      <Widget header="♡ who&apos;s online">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 6px' }}>
          {ONLINE_USERS.map((u, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: u.color,
                  border: '1.5px solid #2B0A2E',
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: -1, right: -1,
                  width: 7, height: 7,
                  borderRadius: '50%',
                  background: '#28C840',
                  border: '1px solid white',
                }} />
              </div>
              <span style={{ fontFamily: 'Verdana, Tahoma, sans-serif', fontSize: 9, color: '#3A0030' }}>
                {u.name}
              </span>
            </div>
          ))}
        </div>
      </Widget>

      {/* Hit counter */}
      <Widget header="◎ visitor counter">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontFamily: 'Verdana, Tahoma, sans-serif', fontSize: 10, color: '#888' }}>
            you are visitor #
          </div>
          <HitCounter />
        </div>
      </Widget>

      {/* Now playing */}
      <Widget header="♪ now playing">
        <NowPlaying />
      </Widget>

      {/* Daily prompt countdown */}
      <Widget header="⏱ next prompt in...">
        <MidnightCountdown />
      </Widget>

      {/* Theme switcher */}
      <Widget header="✿ change skin">
        <ThemeSwitcher />
      </Widget>

    </div>
  )
}
