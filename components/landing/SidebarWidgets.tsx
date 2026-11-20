'use client'

import { useState, useEffect } from 'react'
import ThemeSwitcher from '@/components/ui/ThemeSwitcher'

export interface ActivityItem {
  username: string
  text: string
  _isDemo?: true
}

export interface OnlineUser {
  username: string
  _isDemo?: true
}

interface Props {
  activity?: ActivityItem[]
  onlineUsers?: OnlineUser[]
  memberCount?: number
}

const USER_PALETTE = ['#FFB6D9', '#C9A2FF', '#FFF0A8', '#A8DFFF', '#FFD6EC', '#E8D6FF', '#B6FFD9', '#FFB899', '#D6EDFF']
const MSG_PALETTE = ['#FF4FA3', '#7C4DDB', '#FF6B00', '#6FE3FF', '#28C840']

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

function HitCounter({ count }: { count: number }) {
  const str = String(count).padStart(6, '0').slice(-6)
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {str.split('').map((d, i) => (
        <span key={i} className="counter-digit">{d}</span>
      ))}
    </div>
  )
}

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
      <button
        style={{
          width: 20, height: 20,
          background: 'linear-gradient(180deg, #d4d0c8, #bfbdb5)',
          border: '1px solid',
          borderColor: '#ffffff #808080 #808080 #ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, cursor: 'pointer', flexShrink: 0,
        }}
        aria-label="Play"
      >
        ▶
      </button>
      <div style={{ overflow: 'hidden', flex: 1, background: '#000', border: '1px inset #333', padding: '1px 3px' }}>
        <div style={{
          fontFamily: "'Silkscreen', monospace",
          fontSize: 12,
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

export default function SidebarWidgets({ activity = [], onlineUsers = [], memberCount = 0 }: Props) {
  return (
    <div className="flex flex-col gap-3">

      <Widget header="✦ recent activity!">
        {activity.length === 0 ? (
          <div style={{ fontFamily: 'Verdana, Tahoma, sans-serif', fontSize: 12, color: '#aaa', lineHeight: 1.5 }}>
            Nothing happening just yet. Be the first to leave a little mark! ♡
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {activity.map((m, i) => (
              <div key={i} style={{ fontFamily: 'Verdana, Tahoma, sans-serif', fontSize: 12, lineHeight: 1.4 }}>
                <span style={{ color: MSG_PALETTE[i % MSG_PALETTE.length], fontWeight: 'bold' }}>{m.username}:</span>{' '}
                <span style={{ color: '#3A0030' }} className="line-clamp-1">{m.text}</span>
                {i === activity.length - 1 && (
                  <span className="animate-blink" style={{ marginLeft: 1, color: '#FF4FA3' }}>|</span>
                )}
              </div>
            ))}
          </div>
        )}
      </Widget>

      <Widget header="♡ who's online">
        {onlineUsers.length === 0 ? (
          <div style={{ fontFamily: 'Verdana, Tahoma, sans-serif', fontSize: 12, color: '#aaa', lineHeight: 1.5 }}>
            No one online right now. Come back later! ♡
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 6px' }}>
            {onlineUsers.map((u, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: USER_PALETTE[i % USER_PALETTE.length],
                    border: '1.5px solid #2B0A2E',
                  }} />
                  <div style={{
                    position: 'absolute', bottom: -1, right: -1,
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#28C840', border: '1px solid white',
                  }} />
                </div>
                <span style={{ fontFamily: 'Verdana, Tahoma, sans-serif', fontSize: 12, color: '#3A0030', maxWidth: 36, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {u.username.length > 7 ? u.username.slice(0, 7) : u.username}
                </span>
              </div>
            ))}
          </div>
        )}
      </Widget>

      <Widget header="◎ scrappy members">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontFamily: 'Verdana, Tahoma, sans-serif', fontSize: 12, color: '#888' }}>
            total members
          </div>
          <HitCounter count={memberCount} />
        </div>
      </Widget>

      <Widget header="♪ now playing">
        <NowPlaying />
      </Widget>

      <Widget header="⏱ next prompt in...">
        <MidnightCountdown />
      </Widget>

      <Widget header="✿ change skin">
        <ThemeSwitcher />
      </Widget>

    </div>
  )
}
