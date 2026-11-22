'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { starterCover, PAGE_W, PAGE_H, type NbPage } from '@/lib/notebook'
import { StaticCover } from '@/components/notebook/Spread'
import DashboardScrapbooks, { type DashScrapbook } from './DashboardScrapbooks'
import type { TodayPrompt } from './TodayOnScrappy'
import type { ReactNode } from 'react'

export interface DashboardProps {
  user: { username: string; id: string }
  prompt?: TodayPrompt | null
  latestScrapbook?: { id: string; title: string; cover_id: string } | null
  scrapbooks: DashScrapbook[]
  announcementsSlot?: ReactNode
}

const QUICK_TILES = [
  { href: '/scrapbook/create', icon: '✦', label: 'New scrapbook', color: '#E0007A' },
  { href: '/photobooth',       icon: '◎', label: 'Photobooth',    color: '#1D9BF0' },
  { href: '/prompts',          icon: '◆', label: 'Daily prompt',  color: '#7C4DDB' },
  { href: '/confessions',      icon: '♡', label: 'Confessions',   color: '#F43F5E' },
  { href: '/exchange',         icon: '✉', label: 'Note exchange', color: '#14B8A6' },
]

function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  const handle = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handle}
      style={{
        minHeight: 36,
        padding: '0 14px',
        border: '2px solid #2B0A2E',
        borderRadius: 999,
        background: copied ? '#E0FFF8' : 'white',
        color: copied ? '#14B8A6' : '#2B0A2E',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 800,
        fontSize: 13,
        cursor: 'pointer',
        transition: 'background 0.2s, color 0.2s',
        whiteSpace: 'nowrap',
      }}
    >
      {copied ? '✓ Copied!' : '⎘ Copy link'}
    </button>
  )
}

function LatestScrapbookCard({ sb }: { sb: { id: string; title: string; cover_id: string } }) {
  const SCALE = 0.18
  const W = Math.round(PAGE_W * SCALE)
  const H = Math.round(PAGE_H * SCALE)
  const [cover, setCover] = useState<NbPage | null>(null)
  useEffect(() => { setCover(starterCover(sb.cover_id, sb.title || 'my scrapbook')) }, [sb])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
      <Link
        href={`/scrapbook/${sb.id}/edit`}
        style={{ display: 'block', width: W, height: H, flexShrink: 0, borderRadius: 6, overflow: 'hidden', border: '2px solid #2B0A2E', boxShadow: '2px 2px 0 #2B0A2E', position: 'relative' }}
      >
        <div style={{ position: 'relative', width: W, height: H, overflow: 'hidden' }}>
          <div className="pointer-events-none absolute left-0 top-0 origin-top-left" style={{ transform: `scale(${SCALE})`, width: PAGE_W, height: PAGE_H }}>
            {cover ? <StaticCover page={cover} /> : <div style={{ width: PAGE_W, height: PAGE_H, background: '#f3e3ee' }} />}
          </div>
        </div>
      </Link>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-nunito font-extrabold truncate" style={{ fontSize: 15, color: 'var(--c-text)', marginBottom: 6 }}>
          {sb.title || 'untitled'}
        </div>
        <Link href={`/scrapbook/${sb.id}/edit`} className="btn-pill btn-pill-pink" style={{ fontSize: 13, minHeight: 36 }}>
          Keep decorating →
        </Link>
      </div>
    </div>
  )
}

export default function HomeDashboard({ user, prompt, latestScrapbook, scrapbooks, announcementsSlot }: DashboardProps) {
  const profileUrl = `https://scrappy.fun/profile/${user.username}`

  return (
    <div style={{ padding: '20px 20px 0', maxWidth: 1120, margin: '0 auto' }}>

      {/* ── Top row: Profile preview + latest scrapbook ── */}
      <div className="grid md:grid-cols-2 gap-4 mb-5">

        {/* Profile card — browser chrome mockup */}
        <div style={{ background: 'white', border: '2.5px solid #2B0A2E', borderRadius: 14, boxShadow: '4px 4px 0 #2B0A2E', overflow: 'hidden' }}>
          {/* Chrome bar */}
          <div style={{ background: '#f0eff5', borderBottom: '2.5px solid #2B0A2E', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57', border: '1px solid rgba(0,0,0,.12)' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E', border: '1px solid rgba(0,0,0,.12)' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840', border: '1px solid rgba(0,0,0,.12)' }} />
            </div>
            <div style={{ flex: 1, background: 'white', border: '1.5px solid #ddd', borderRadius: 6, padding: '3px 10px', fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              scrappy.fun/profile/{user.username}
            </div>
            <span
              className="font-silkscreen flex-shrink-0"
              style={{ fontSize: 9, color: '#14B8A6', background: '#E0FFF8', padding: '2px 7px', borderRadius: 4, border: '1px solid #14B8A6', letterSpacing: '0.08em' }}
            >
              PUBLIC
            </span>
          </div>

          {/* Profile preview */}
          <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #FFF0F7 0%, #F5EEFF 100%)', display: 'flex', alignItems: 'center', gap: 14, minHeight: 76 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #FF4FA3, #C9A2FF)', border: '2.5px solid #2B0A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Pacifico', cursive", fontSize: 20, color: 'white', flexShrink: 0 }}>
              {user.username[0].toUpperCase()}
            </div>
            <div>
              <div className="font-pacifico" style={{ fontSize: 18, color: '#2B0A2E', lineHeight: 1.2 }}>@{user.username}</div>
              <div className="font-nunito" style={{ fontSize: 12, color: '#999', marginTop: 1 }}>your profile page</div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ padding: '12px 14px', borderTop: '2.5px solid #2B0A2E', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href={`/profile/${user.username}`} target="_blank" style={{ minHeight: 36, padding: '0 14px', border: '2px solid #2B0A2E', borderRadius: 999, background: '#E0007A', color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Open my page
            </Link>
            <Link href="/my-space" style={{ minHeight: 36, padding: '0 14px', border: '2px solid #2B0A2E', borderRadius: 999, background: 'white', color: '#2B0A2E', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Customize
            </Link>
            <CopyLinkButton url={profileUrl} />
          </div>
        </div>

        {/* Pick up where you left off */}
        <div style={{ background: 'white', border: '2.5px solid #2B0A2E', borderRadius: 14, boxShadow: '4px 4px 0 #2B0A2E', overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '2.5px solid #2B0A2E', background: '#FFF0F7' }}>
            <div className="font-silkscreen" style={{ fontSize: 10, color: '#E0007A', letterSpacing: '0.08em' }}>PICK UP WHERE YOU LEFT OFF</div>
          </div>
          {latestScrapbook ? (
            <LatestScrapbookCard sb={latestScrapbook} />
          ) : (
            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
              <div className="font-nunito" style={{ fontSize: 14, color: 'var(--c-text)', opacity: 0.6, marginBottom: 12 }}>No scrapbooks yet</div>
              <Link href="/scrapbook/create" className="btn-pill btn-pill-pink" style={{ fontSize: 13, minHeight: 36 }}>Start your first →</Link>
            </div>
          )}
        </div>
      </div>

      {/* ── 5 quick-action tiles ── */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {QUICK_TILES.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              padding: '14px 8px',
              background: 'white',
              border: '2.5px solid #2B0A2E',
              borderRadius: 12,
              boxShadow: '3px 3px 0 #2B0A2E',
              textDecoration: 'none',
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
            className="hover:-translate-y-0.5"
          >
            <span style={{ fontSize: 22, color: t.color }}>{t.icon}</span>
            <span className="font-nunito font-extrabold text-center" style={{ fontSize: 11, color: 'var(--c-text)', lineHeight: 1.2 }}>{t.label}</span>
          </Link>
        ))}
      </div>

      {/* ── Today's prompt strip ── */}
      {prompt && (
        <div style={{ marginBottom: 20, background: '#FFF8ED', backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(100,160,220,0.15) 27px, rgba(100,160,220,0.15) 28px)', border: '2.5px solid #2B0A2E', borderRadius: 14, boxShadow: '4px 4px 0 #2B0A2E', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div className="font-silkscreen flex-shrink-0" style={{ fontSize: 10, color: '#7C4DDB', letterSpacing: '0.08em' }}>TODAY&apos;S PROMPT</div>
          <div className="font-nunito font-extrabold flex-1" style={{ fontSize: 15, color: '#2B0A2E', minWidth: 200 }}>
            {prompt.question_text}
          </div>
          <Link href="/prompts" className="btn-pill flex-shrink-0" style={{ fontSize: 13, minHeight: 36, background: '#7C4DDB', color: 'white', borderColor: '#2B0A2E' }}>
            Answer →
          </Link>
        </div>
      )}

      {/* ── Hangout announcements ── */}
      {announcementsSlot && (
        <div style={{ marginBottom: 20 }}>
          {announcementsSlot}
        </div>
      )}

      {/* ── My scrapbooks ── */}
      <section style={{ marginBottom: 32 }}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="font-silkscreen" style={{ fontSize: 10, color: 'var(--c-primary)', letterSpacing: '0.08em', marginBottom: 2 }}>YOUR WORK</div>
            <h2 className="font-pacifico" style={{ fontSize: 'clamp(22px, 3vw, 30px)', color: 'var(--c-text)', lineHeight: 1.1 }}>
              my scrapbooks ({scrapbooks.length})
            </h2>
          </div>
          <Link href="/scrapbook/create" className="btn-pill btn-pill-pink" style={{ fontSize: 13, minHeight: 36 }}>
            + New
          </Link>
        </div>
        <DashboardScrapbooks scrapbooks={scrapbooks} />
      </section>

    </div>
  )
}
