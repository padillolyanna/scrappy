'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/useAuth'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

// ─── Menu data ────────────────────────────────────────────────────────────────

const CREATE_ITEMS = [
  { href: '/my-space', label: 'My Scrapbooks', desc: 'Manage your collection', icon: '📔' },
  { href: '/scrapbook/create', label: 'Create Scrapbook', desc: 'Start a new digital journal', icon: '✦' },
  { href: '/photobooth', label: 'Photobooth', desc: 'Take and customize photo strips', icon: '📷' },
  { href: '/my-space', label: 'Saved Items', desc: 'Revisit your favorites', icon: '♡' },
]

const COMMUNITY_ITEMS = [
  { href: '/highlights', label: 'Highlights', desc: 'Featured scrapbooks', icon: '★' },
  { href: '/confessions', label: 'Confession Wall', desc: 'Anonymous confessions', icon: '💌' },
  { href: '/prompts', label: 'Daily Prompt', desc: 'Answer the question of the day', icon: '◆' },
  { href: '/exchange', label: 'Scrapbook Exchange', desc: 'Exchange notes with others', icon: '🔄' },
]

const PROFILE_ITEMS = [
  { href: '__PROFILE__', label: 'My Profile', icon: '👤' },
  { href: '/my-space', label: 'My Space', icon: '🏠' },
  { href: '/my-space', label: 'Saved Scrapbooks', icon: '♡' },
  { href: '/exchange', label: 'My Exchanges', icon: '🔄' },
  { href: '__SETTINGS__', label: 'Account Settings', icon: '⚙️' },
]

// ─── Dropdown panel ───────────────────────────────────────────────────────────

interface DropItem { href: string; label: string; desc?: string; icon: string }

function DropPanel({
  items,
  onClose,
  align = 'center',
}: {
  items: DropItem[]
  onClose: () => void
  align?: 'center' | 'right'
}) {
  return (
    <div
      className="absolute top-[calc(100%+10px)] z-[200] w-64 bg-white/98 backdrop-blur-sm rounded-2xl border-2 border-[#FFB6D9]/70 shadow-xl py-2 overflow-hidden"
      style={{
        left: align === 'right' ? 'auto' : '50%',
        right: align === 'right' ? 0 : 'auto',
        transform: align === 'center' ? 'translateX(-50%)' : 'none',
      }}
    >
      <div className="px-3 pb-1 font-pixel text-[#FFB6D9]" style={{ fontSize: '8px' }}>✦ ✦ ✦</div>
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href.startsWith('__') ? '#' : item.href}
          onClick={onClose}
          className="flex items-start gap-3 mx-2 px-3 py-2.5 rounded-xl hover:bg-[#FFB6D9]/15 transition-colors group"
        >
          <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
          <div>
            <div className="font-pixel text-[#3A0030] group-hover:text-[#FF4FA3] transition-colors" style={{ fontSize: '11px' }}>
              {item.label}
            </div>
            {item.desc && (
              <div className="font-nunito text-[#888] mt-0.5" style={{ fontSize: '11px' }}>{item.desc}</div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

type OpenMenu = 'create' | 'community' | 'profile' | null

export default function Navbar() {
  const [open, setOpen] = useState<OpenMenu>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSection, setMobileSection] = useState<'create' | 'community' | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const { user, loading } = useAuth()
  const router = useRouter()
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'you'
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const avatarInitial = username.charAt(0).toUpperCase()

  // Click outside & Escape
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(null)
        setMobileOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpen(null); setMobileOpen(false) }
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  function toggle(menu: OpenMenu) {
    setOpen(prev => prev === menu ? null : menu)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  function closeAll() {
    setOpen(null)
    setMobileOpen(false)
    setMobileSection(null)
  }

  // Resolve __PROFILE__ and __SETTINGS__ tokens
  const profileItems = PROFILE_ITEMS.map(item => ({
    ...item,
    href: item.href === '__PROFILE__'
      ? `/profile/${username}`
      : item.href === '__SETTINGS__'
      ? `/profile/${username}/edit`
      : item.href,
  }))

  const navLinkCls = 'font-pixel px-3 py-2 rounded-full transition-all duration-150 whitespace-nowrap text-[#3A0030] hover:bg-[#FFB6D9]/30'

  const dropTriggerCls = (menu: OpenMenu) =>
    `flex items-center gap-1 font-pixel px-3 py-2 rounded-full transition-all duration-150 whitespace-nowrap ${
      open === menu
        ? 'bg-[#FFB6D9] text-white'
        : 'text-[#3A0030] hover:bg-[#FFB6D9]/30'
    }`

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-[100] bg-white/92 backdrop-blur-md border-b-2 border-[#FFB6D9] shadow-sm"
      style={{ overflow: 'visible' }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link href={user ? '/my-space' : '/'} className="flex items-center gap-1.5 flex-shrink-0 group py-1">
          <span
            className="font-pacifico text-glitter"
            style={{ fontFamily: 'Pacifico, cursive', fontSize: '28px', lineHeight: '1.3', display: 'block' }}
          >
            SCRAPPY
          </span>
          <span className="animate-sparkle text-[#FF4FA3]" style={{ fontSize: '18px' }}>✦</span>
        </Link>

        {/* ── Desktop nav — centered ── */}
        <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          <Link href={user ? '/my-space' : '/'} className={navLinkCls} style={{ fontSize: '13px' }}>
            HOME
          </Link>
          <Link href="/explore" className={navLinkCls} style={{ fontSize: '13px' }}>
            EXPLORE
          </Link>

          {/* CREATE dropdown */}
          <div className="relative">
            <button
              onClick={() => toggle('create')}
              className={dropTriggerCls('create')}
              style={{ fontSize: '12px' }}
              aria-expanded={open === 'create'}
            >
              CREATE
              <span style={{ fontSize: '9px', marginTop: '1px' }}>{open === 'create' ? '▴' : '▾'}</span>
            </button>
            {open === 'create' && (
              <DropPanel items={CREATE_ITEMS} onClose={closeAll} align="center" />
            )}
          </div>

          {/* COMMUNITY dropdown */}
          <div className="relative">
            <button
              onClick={() => toggle('community')}
              className={dropTriggerCls('community')}
              style={{ fontSize: '13px' }}
              aria-expanded={open === 'community'}
            >
              COMMUNITY
              <span style={{ fontSize: '9px', marginTop: '1px' }}>{open === 'community' ? '▴' : '▾'}</span>
            </button>
            {open === 'community' && (
              <DropPanel items={COMMUNITY_ITEMS} onClose={closeAll} align="center" />
            )}
          </div>
        </div>

        {/* ── Desktop auth ── */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {!loading && (
            user ? (
              <>
                {/* Notifications */}
                <Link
                  href="/my-space"
                  className="w-9 h-9 rounded-full border-2 border-[#FFB6D9] flex items-center justify-center hover:border-[#FF4FA3] transition-colors"
                  title="Notifications"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF4FA3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </Link>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => toggle('profile')}
                    className="flex items-center gap-2 font-pixel text-[#3A0030] pl-1 pr-3 py-1 rounded-full border-2 border-[#FFB6D9] hover:border-[#FF4FA3] transition-all"
                    style={{ fontSize: '12px' }}
                    aria-expanded={open === 'profile'}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={username} className="w-7 h-7 rounded-full object-cover border border-[#FFB6D9]" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#FF4FA3] flex items-center justify-center text-white font-pixel flex-shrink-0" style={{ fontSize: '12px' }}>
                        {avatarInitial}
                      </div>
                    )}
                    <span className="max-w-[80px] truncate">@{username}</span>
                    <span className="text-[#888]" style={{ fontSize: '9px' }}>{open === 'profile' ? '▴' : '▾'}</span>
                  </button>

                  {open === 'profile' && (
                    <div className="absolute right-0 top-[calc(100%+10px)] z-[200] w-56 bg-white/98 backdrop-blur-sm rounded-2xl border-2 border-[#FFB6D9]/70 shadow-xl py-2 overflow-hidden">
                      <div className="px-3 pb-1 font-pixel text-[#FFB6D9]" style={{ fontSize: '8px' }}>✦ ✦ ✦</div>
                      {profileItems.map(item => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={closeAll}
                          className="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl hover:bg-[#FFB6D9]/15 transition-colors group"
                        >
                          <span className="text-base flex-shrink-0">{item.icon}</span>
                          <span className="font-pixel text-[#3A0030] group-hover:text-[#FF4FA3] transition-colors" style={{ fontSize: '11px' }}>
                            {item.label}
                          </span>
                        </Link>
                      ))}
                      <div className="mx-2 mt-1 pt-1 border-t border-[#FFB6D9]/30">
                        <button
                          onClick={() => { closeAll(); handleLogout() }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors group"
                        >
                          <span className="text-base">👋</span>
                          <span className="font-pixel text-[#888] group-hover:text-red-400 transition-colors" style={{ fontSize: '11px' }}>
                            Log Out
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="btn-outline-y2k whitespace-nowrap"
                  style={{ fontSize: '12px', padding: '5px 14px' }}
                >
                  LOG IN
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn-y2k whitespace-nowrap"
                  style={{ fontSize: '12px', padding: '5px 14px' }}
                >
                  JOIN SCRAPPY ✦
                </Link>
              </>
            )
          )}
        </div>

        {/* ── Mobile burger ── */}
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full border-2 border-[#FFB6D9] text-[#FF4FA3] hover:border-[#FF4FA3] transition-colors flex-shrink-0"
          aria-label="Toggle menu"
        >
          <span className="font-bold text-lg leading-none">{mobileOpen ? '×' : '☰'}</span>
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="lg:hidden bg-white/98 border-t-2 border-[#FFB6D9]/50 px-4 py-3 space-y-1 shadow-lg">
          {/* Top links */}
          <Link
            href={user ? '/my-space' : '/'}
            onClick={closeAll}
            className="flex items-center font-pixel text-[#3A0030] py-3 px-3 rounded-xl hover:bg-[#FFB6D9]/15 transition-colors border-b border-[#FFB6D9]/20"
            style={{ fontSize: '13px' }}
          >
            HOME
          </Link>
          <Link
            href="/explore"
            onClick={closeAll}
            className="flex items-center font-pixel text-[#3A0030] py-3 px-3 rounded-xl hover:bg-[#FFB6D9]/15 transition-colors border-b border-[#FFB6D9]/20"
            style={{ fontSize: '13px' }}
          >
            EXPLORE
          </Link>

          {/* CREATE accordion */}
          <div>
            <button
              onClick={() => setMobileSection(s => s === 'create' ? null : 'create')}
              className="w-full flex items-center justify-between font-pixel text-[#3A0030] py-3 px-3 rounded-xl hover:bg-[#FFB6D9]/15 transition-colors border-b border-[#FFB6D9]/20"
              style={{ fontSize: '13px' }}
            >
              CREATE
              <span style={{ fontSize: '9px' }}>{mobileSection === 'create' ? '▴' : '▾'}</span>
            </button>
            {mobileSection === 'create' && (
              <div className="mt-1 ml-3 space-y-0.5">
                {CREATE_ITEMS.map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={closeAll}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-[#FFB6D9]/15 transition-colors"
                  >
                    <span className="text-base">{item.icon}</span>
                    <div>
                      <div className="font-pixel text-[#3A0030]" style={{ fontSize: '11px' }}>{item.label}</div>
                      {item.desc && <div className="font-nunito text-[#888]" style={{ fontSize: '11px' }}>{item.desc}</div>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* COMMUNITY accordion */}
          <div>
            <button
              onClick={() => setMobileSection(s => s === 'community' ? null : 'community')}
              className="w-full flex items-center justify-between font-pixel text-[#3A0030] py-3 px-3 rounded-xl hover:bg-[#FFB6D9]/15 transition-colors border-b border-[#FFB6D9]/20"
              style={{ fontSize: '13px' }}
            >
              COMMUNITY
              <span style={{ fontSize: '9px' }}>{mobileSection === 'community' ? '▴' : '▾'}</span>
            </button>
            {mobileSection === 'community' && (
              <div className="mt-1 ml-3 space-y-0.5">
                {COMMUNITY_ITEMS.map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={closeAll}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-[#FFB6D9]/15 transition-colors"
                  >
                    <span className="text-base">{item.icon}</span>
                    <div>
                      <div className="font-pixel text-[#3A0030]" style={{ fontSize: '11px' }}>{item.label}</div>
                      {item.desc && <div className="font-nunito text-[#888]" style={{ fontSize: '11px' }}>{item.desc}</div>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Mobile auth */}
          <div className="pt-3 border-t border-[#FFB6D9]/30">
            {user ? (
              <div className="space-y-1">
                {profileItems.map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={closeAll}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-[#FFB6D9]/15 transition-colors"
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="font-pixel text-[#3A0030]" style={{ fontSize: '11px' }}>{item.label}</span>
                  </Link>
                ))}
                <button
                  onClick={() => { closeAll(); handleLogout() }}
                  className="flex items-center gap-3 w-full py-2.5 px-3 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <span className="text-base">👋</span>
                  <span className="font-pixel text-[#888]" style={{ fontSize: '11px' }}>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/login" onClick={closeAll} className="btn-outline-y2k flex-1 text-center" style={{ fontSize: '13px' }}>
                  LOG IN
                </Link>
                <Link href="/auth/signup" onClick={closeAll} className="btn-y2k flex-1 text-center" style={{ fontSize: '13px' }}>
                  JOIN SCRAPPY
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
