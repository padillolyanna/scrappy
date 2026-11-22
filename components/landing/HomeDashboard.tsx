'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import Link from 'next/link'
import { starterCover, PAGE_W, PAGE_H, type NbPage } from '@/lib/notebook'
import { StaticCover } from '@/components/notebook/Spread'
import DashboardScrapbooks, { type DashScrapbook } from './DashboardScrapbooks'
import type { TodayPrompt } from './TodayOnScrappy'
import type { ProfileData } from '@/components/profile/ProfileLayout'
import type { ProfileStyle, ProfileExtras } from '@/lib/profileStyle'
import { backgroundStyle } from '@/lib/profileStyle'

export interface DashboardProps {
  user: { username: string; id: string }
  prompt?: TodayPrompt | null
  hasAnsweredToday?: boolean
  latestScrapbook?: { id: string; title: string; cover_id: string } | null
  scrapbooks: DashScrapbook[]
  favoritesCount?: number
  confessionsCount?: number
  profileData?: ProfileData | null
  profileStyle?: ProfileStyle | null
  profileExtras?: ProfileExtras | null
  profilePublicScrapbooks?: { id: string; title: string | null; cover_id: string; like_count: number | null }[]
}

type Tab = 'scrapbooks' | 'favorites' | 'confessions'

const QUICK_TILES = [
  { href: '/scrapbook/create', icon: '✦', label: 'New scrapbook', bg: 'var(--pink-soft)' },
  { href: '/photobooth',       icon: '◎', label: 'Photobooth',    bg: 'var(--purple-soft)' },
  { href: '/prompts',          icon: '◆', label: 'Daily prompt',  bg: 'var(--yellow)' },
  { href: '/confessions',      icon: '♡', label: 'Confessions',   bg: 'var(--blue-soft)' },
  { href: '/explore',          icon: '✿', label: 'Explore',       bg: 'var(--green-soft)' },
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
      className="font-nunito font-extrabold"
      style={{
        minHeight: 36, padding: '0 14px',
        border: '2px solid var(--ink)', borderRadius: 999,
        background: copied ? '#E0FFF8' : 'white',
        color: copied ? '#14B8A6' : 'var(--ink)',
        fontSize: 13, cursor: 'pointer',
        transition: 'background 0.2s, color 0.2s', whiteSpace: 'nowrap',
      }}
    >
      {copied ? '✓ Copied!' : '⎘ Copy link'}
    </button>
  )
}

// Scaled profile preview card
function PagePreviewCard({ profileData, pStyle, username }: { profileData: ProfileData | null; pStyle: ProfileStyle | null; username: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.3)

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(([entry]) => {
      const containerW = entry.contentRect.width
      setScale(containerW / 1000)
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  const bgCss = pStyle ? backgroundStyle(pStyle) : { background: 'linear-gradient(135deg, #FFF0F7, #EFE6FF)' }
  const previewH = 340

  return (
    <div style={{ background: 'white', border: '2.5px solid var(--ink)', borderRadius: 16, boxShadow: '4px 6px 0 var(--ink)', overflow: 'hidden' }}>
      {/* Card header */}
      <div style={{ padding: '12px 16px', borderBottom: '2.5px solid var(--ink)', background: 'var(--pink-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div className="font-silkscreen" style={{ fontSize: 11, color: 'var(--pink-text)', letterSpacing: '0.08em', marginBottom: 2 }}>✦ YOUR PAGE</div>
          <div className="font-nunito" style={{ fontSize: 13, color: 'var(--ink)', opacity: 0.6 }}>what visitors see right now</div>
        </div>
        <span className="font-silkscreen" style={{ fontSize: 10, color: '#14B8A6', background: '#E0FFF8', padding: '3px 8px', borderRadius: 4, border: '1.5px solid #14B8A6', letterSpacing: '0.08em' }}>
          PUBLIC
        </span>
      </div>

      {/* Browser chrome */}
      <div style={{ background: '#f0eff5', borderBottom: '2px solid var(--ink)', padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57', border: '1px solid rgba(0,0,0,.12)' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E', border: '1px solid rgba(0,0,0,.12)' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840', border: '1px solid rgba(0,0,0,.12)' }} />
        </div>
        <div style={{ flex: 1, background: 'white', border: '1.5px solid #ddd', borderRadius: 5, padding: '3px 10px', fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          scrappy.fun/profile/{username}
        </div>
      </div>

      {/* Scaled preview */}
      <Link href={`/profile/${username}`} target="_blank" style={{ display: 'block', position: 'relative', height: previewH, overflow: 'hidden', cursor: 'pointer' }}>
        <div ref={containerRef} style={{ position: 'absolute', inset: 0 }}>
          {/* Background preview */}
          <div
            aria-hidden
            style={{ ...bgCss, position: 'absolute', inset: 0, transformOrigin: 'top left', transform: `scale(${scale})`, width: `${100 / scale}%`, height: `${previewH / scale}px`, pointerEvents: 'none' }}
          >
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #FF4FA3, #C9A2FF)', border: '3px solid rgba(255,255,255,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 32, fontFamily: 'Pacifico, cursive', flexShrink: 0 }}>
                  {username[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 28, fontFamily: 'Pacifico, cursive', color: pStyle?.nameColor ?? '#FF6FD8', marginBottom: 4 }}>@{username}</div>
                  <div style={{ fontSize: 16, fontFamily: 'Verdana, sans-serif', color: pStyle?.panelText ?? '#1A0A1E', opacity: 0.7 }}>
                    {profileData?.mood ?? ''}
                  </div>
                </div>
              </div>
              {profileData?.bio && (
                <div style={{ fontSize: 15, fontFamily: 'Verdana, sans-serif', color: pStyle?.panelText ?? '#1A0A1E', lineHeight: 1.5, maxWidth: 600, background: `${pStyle?.panelBg ?? 'white'}CC`, padding: '12px 16px', borderRadius: 8, border: `1px solid ${pStyle?.borderColor ?? '#E35BD0'}` }}>
                  {profileData.bio}
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'transparent' }} />
      </Link>

      {/* Actions */}
      <div style={{ padding: '12px 14px', borderTop: '2.5px solid var(--ink)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link href={`/profile/${username}`} target="_blank" className="font-nunito font-extrabold" style={{ minHeight: 36, padding: '0 14px', border: '2px solid var(--ink)', borderRadius: 999, background: 'var(--pink)', color: 'white', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
          Open my page
        </Link>
        <Link href="/my-space" className="font-nunito font-extrabold" style={{ minHeight: 36, padding: '0 14px', border: '2px solid var(--ink)', borderRadius: 999, background: 'var(--purple-soft)', color: 'var(--ink)', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
          Customize
        </Link>
        <CopyLinkButton url={`https://scrappy.fun/profile/${username}`} />
      </div>
    </div>
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
        style={{ display: 'block', width: W, height: H, flexShrink: 0, borderRadius: 6, overflow: 'hidden', border: '2px solid var(--ink)', boxShadow: '2px 2px 0 var(--ink)', position: 'relative', animation: 'nb-float-y 5s ease-in-out infinite' }}
      >
        <div style={{ position: 'relative', width: W, height: H, overflow: 'hidden' }}>
          <div className="pointer-events-none absolute left-0 top-0 origin-top-left" style={{ transform: `scale(${SCALE})`, width: PAGE_W, height: PAGE_H }}>
            {cover ? <StaticCover page={cover} /> : <div style={{ width: PAGE_W, height: PAGE_H, background: '#f3e3ee' }} />}
          </div>
        </div>
      </Link>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-nunito font-extrabold truncate" style={{ fontSize: 15, color: 'var(--ink)', marginBottom: 6 }}>
          {sb.title || 'untitled'}
        </div>
        <Link href={`/scrapbook/${sb.id}/edit`} className="font-nunito font-extrabold" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 36, padding: '0 14px', borderRadius: 999, border: '2px solid var(--ink)', background: 'var(--pink)', color: 'white', fontSize: 13, textDecoration: 'none' }}>
          Keep decorating →
        </Link>
      </div>
    </div>
  )
}

export default function HomeDashboard({
  user, prompt, hasAnsweredToday, latestScrapbook, scrapbooks,
  favoritesCount = 0, confessionsCount = 0,
  profileData, profileStyle: pStyle, profilePublicScrapbooks = [],
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('scrapbooks')

  return (
    <div style={{ padding: '24px 24px 0', maxWidth: 'var(--content-width)', margin: '0 auto' }}>

      {/* ── C2: Greeting ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #FF4FA3, #C9A2FF)', border: '3px solid white', outline: '3px solid var(--pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontFamily: 'Pacifico, cursive', color: 'white', flexShrink: 0 }}>
          {user.username[0].toUpperCase()}
        </div>
        <div>
          <h1 className="font-pacifico" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: 'var(--ink)', lineHeight: 1.1 }}>
            hi @{user.username} ✦
          </h1>
          <div className="font-nunito" style={{ fontSize: 15, color: 'var(--ink)', opacity: 0.6, marginTop: 4 }}>
            {scrapbooks.length > 0 && `${scrapbooks.length} scrapbook${scrapbooks.length !== 1 ? 's' : ''}`}
          </div>
        </div>
      </div>

      {/* ── C3 + C4: Two columns ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}
        className="[grid-template-columns:1fr] sm:[grid-template-columns:1fr_1fr]"
      >
        {/* C3: Your page preview */}
        <PagePreviewCard profileData={profileData ?? null} pStyle={pStyle ?? null} username={user.username} />

        {/* C4: Pick up where you left off */}
        <div style={{ background: 'white', border: '2.5px solid var(--ink)', borderRadius: 16, boxShadow: '4px 6px 0 var(--ink)', overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '2.5px solid var(--ink)', background: 'var(--pink-soft)' }}>
            <div className="font-silkscreen" style={{ fontSize: 10, color: 'var(--pink-text)', letterSpacing: '0.08em' }}>PICK UP WHERE YOU LEFT OFF</div>
          </div>
          {latestScrapbook ? (
            <LatestScrapbookCard sb={latestScrapbook} />
          ) : (
            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
              <div className="font-nunito" style={{ fontSize: 14, color: 'var(--ink)', opacity: 0.6, marginBottom: 12 }}>No scrapbooks yet</div>
              <Link href="/scrapbook/create" className="font-nunito font-extrabold" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 36, padding: '0 14px', borderRadius: 999, border: '2px solid var(--ink)', background: 'var(--pink)', color: 'white', fontSize: 13, textDecoration: 'none' }}>
                Start your first →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── C5: Quick action tiles ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}
        className="[grid-template-columns:repeat(2,1fr)] sm:[grid-template-columns:repeat(5,1fr)]"
      >
        {QUICK_TILES.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '14px 8px',
              background: t.bg,
              border: '3px solid var(--ink)',
              borderRadius: 20,
              boxShadow: '4px 4px 0 var(--ink)',
              textDecoration: 'none',
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '4px 7px 0 var(--ink)' }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = '4px 4px 0 var(--ink)' }}
          >
            <span style={{ fontSize: 24, color: 'var(--ink)' }}>{t.icon}</span>
            <span className="font-nunito font-extrabold text-center" style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.2 }}>{t.label}</span>
          </Link>
        ))}
      </div>

      {/* ── C6: Today's prompt ── */}
      {prompt && (
        <div style={{
          marginBottom: 20,
          background: 'var(--yellow)',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(100,160,220,0.15) 27px, rgba(100,160,220,0.15) 28px)',
          border: '2.5px solid var(--ink)', borderRadius: 14, boxShadow: '4px 4px 0 var(--ink)',
          padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}>
          <div className="font-silkscreen flex-shrink-0" style={{ fontSize: 11, color: 'var(--purple)', letterSpacing: '0.08em' }}>TODAY&apos;S PROMPT</div>
          <div className="font-nunito font-extrabold flex-1" style={{ fontSize: 16, color: 'var(--ink)', minWidth: 200 }}>
            {prompt.question_text}
          </div>
          {hasAnsweredToday ? (
            <div className="font-nunito font-extrabold flex-shrink-0" style={{ fontSize: 14, color: '#14B8A6', background: '#E0FFF8', padding: '5px 14px', borderRadius: 999, border: '1.5px solid #14B8A6' }}>
              you answered today ✓
            </div>
          ) : (
            <Link href="/prompts" className="font-nunito font-extrabold flex-shrink-0" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 36, padding: '0 16px', borderRadius: 999, border: '2px solid var(--ink)', background: 'var(--purple)', color: 'white', fontSize: 14, textDecoration: 'none' }}>
              Answer it
            </Link>
          )}
        </div>
      )}

      {/* ── C7: Tabs + scrapbook grid ── */}
      <section style={{ marginBottom: 32 }}>
        {/* Tab row */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 0, flexWrap: 'wrap' }}>
          <div role="tablist" style={{ display: 'flex', gap: 4, flex: 1 }}>
            {([
              { id: 'scrapbooks' as Tab, label: `My scrapbooks (${scrapbooks.length})` },
              { id: 'favorites' as Tab, label: `Favorites (${favoritesCount})` },
              { id: 'confessions' as Tab, label: `Confessions (${confessionsCount})` },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="font-nunito font-extrabold"
                style={{
                  padding: '8px 16px', borderRadius: '10px 10px 0 0',
                  border: '2.5px solid var(--ink)',
                  borderBottom: activeTab === tab.id ? '2.5px solid white' : '2.5px solid var(--ink)',
                  background: activeTab === tab.id ? 'white' : 'transparent',
                  color: 'var(--ink)', fontSize: 14, cursor: 'pointer',
                  marginBottom: activeTab === tab.id ? '-2.5px' : 0,
                  zIndex: activeTab === tab.id ? 1 : 0,
                  position: 'relative',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Link href="/scrapbook/create" className="font-nunito font-extrabold" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 36, padding: '0 14px', borderRadius: 999, border: '2px solid var(--ink)', background: 'var(--pink)', color: 'white', fontSize: 13, textDecoration: 'none', flexShrink: 0 }}>
            + New
          </Link>
        </div>

        {/* Tab content */}
        <div style={{ border: '2.5px solid var(--ink)', borderRadius: '0 14px 14px 14px', background: 'white', padding: 16 }}>
          {activeTab === 'scrapbooks' && <DashboardScrapbooks scrapbooks={scrapbooks} />}
          {activeTab === 'favorites' && (
            <div style={{ textAlign: 'center', padding: '32px 20px' }}>
              {favoritesCount > 0 ? (
                <Link href="/my-space" className="font-nunito font-extrabold" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 36, padding: '0 16px', borderRadius: 999, border: '2px solid var(--ink)', background: 'var(--pink-soft)', color: 'var(--ink)', fontSize: 14, textDecoration: 'none' }}>
                  View my favorites →
                </Link>
              ) : (
                <>
                  <div className="font-nunito" style={{ fontSize: 14, color: 'var(--ink)', opacity: 0.6, marginBottom: 12 }}>Nothing saved yet</div>
                  <Link href="/explore" className="font-nunito font-extrabold" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 36, padding: '0 14px', borderRadius: 999, border: '2px solid var(--ink)', background: 'var(--pink-soft)', color: 'var(--ink)', fontSize: 13, textDecoration: 'none' }}>
                    Explore Scrappy
                  </Link>
                </>
              )}
            </div>
          )}
          {activeTab === 'confessions' && (
            <div style={{ textAlign: 'center', padding: '32px 20px' }}>
              {confessionsCount > 0 ? (
                <Link href="/confessions" className="font-nunito font-extrabold" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 36, padding: '0 16px', borderRadius: 999, border: '2px solid var(--ink)', background: 'var(--blue-soft)', color: 'var(--ink)', fontSize: 14, textDecoration: 'none' }}>
                  View my confessions →
                </Link>
              ) : (
                <>
                  <div className="font-nunito" style={{ fontSize: 14, color: 'var(--ink)', opacity: 0.6, marginBottom: 12 }}>No confessions yet</div>
                  <Link href="/confessions" className="font-nunito font-extrabold" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 36, padding: '0 14px', borderRadius: 999, border: '2px solid var(--ink)', background: 'var(--blue-soft)', color: 'var(--ink)', fontSize: 13, textDecoration: 'none' }}>
                    Leave a confession
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
