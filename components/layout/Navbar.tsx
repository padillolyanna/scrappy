'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/useAuth'
import { useProfile } from '@/lib/useProfile'
import { createClient } from '@/lib/supabase-client'
import { useRouter, usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/explore',         label: 'Explore' },
  { href: '/scrapbook/create', label: 'Scrapbook' },
  { href: '/photobooth',      label: 'Photobooth' },
  { href: '/confessions',     label: 'Community' },
  { href: '/about',           label: 'About' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)
  const { user, loading } = useAuth()
  const { profile } = useProfile()
  const router = useRouter()
  const pathname = usePathname()
  const username = profile?.username || user?.email?.split('@')[0] || 'you'
  const isHome = pathname === '/'

  useEffect(() => {
    if (!avatarMenuOpen) return
    const close = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [avatarMenuOpen])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setAvatarMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <nav
      className="sticky top-0 z-[100]"
      style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '3px solid var(--ink)',
      }}
    >
      <div style={{ maxWidth: 'var(--content-width)', margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

        {/* Logo */}
        <Link
          href="/"
          className="font-pacifico flex-shrink-0"
          style={{ fontSize: 22, color: 'var(--pink-text)', textDecoration: 'none', lineHeight: 1.5 }}
        >
          Scrappy
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {user && (
            <Link
              href="/"
              aria-current={isHome ? 'page' : undefined}
              className="font-silkscreen"
              style={{
                fontSize: 15,
                textDecoration: 'none',
                padding: '5px 14px',
                borderRadius: 999,
                background: isHome ? 'var(--ink)' : 'transparent',
                color: isHome ? 'white' : 'var(--ink)',
                border: isHome ? '2px solid var(--ink)' : '2px solid transparent',
                transition: 'background 0.15s',
              }}
            >
              Home
            </Link>
          )}
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-silkscreen"
              style={{
                fontSize: 15,
                textDecoration: 'none',
                padding: '5px 14px',
                borderRadius: 999,
                color: 'var(--ink)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(43,10,46,.07)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {!loading && (
            user ? (
              <>
                {/* Bell */}
                <button
                  aria-label="Notifications"
                  style={{
                    width: 44, height: 44, borderRadius: '50%', background: 'white',
                    border: '2.5px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', position: 'relative',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </button>

                {/* Avatar pill */}
                <div ref={avatarRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setAvatarMenuOpen((o) => !o)}
                    className="font-nunito font-extrabold"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '5px 14px 5px 6px',
                      borderRadius: 999, background: 'white',
                      border: '2.5px solid var(--ink)',
                      cursor: 'pointer', fontSize: 14, color: 'var(--ink)',
                    }}
                  >
                    <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #FF4FA3, #C9A2FF)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontFamily: 'Pacifico, cursive', flexShrink: 0 }}>
                      {username[0].toUpperCase()}
                    </span>
                    @{username}
                  </button>

                  {avatarMenuOpen && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white', border: '2.5px solid var(--ink)', borderRadius: 14, boxShadow: '4px 4px 0 var(--ink)', minWidth: 180, zIndex: 200, overflow: 'hidden' }}>
                      <Link href={`/profile/${username}`} onClick={() => setAvatarMenuOpen(false)} style={{ display: 'block', padding: '10px 16px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px solid rgba(43,10,46,.1)' }}>My page</Link>
                      <Link href="/my-space" onClick={() => setAvatarMenuOpen(false)} style={{ display: 'block', padding: '10px 16px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px solid rgba(43,10,46,.1)' }}>Customize</Link>
                      <Link href="/my-space" onClick={() => setAvatarMenuOpen(false)} style={{ display: 'block', padding: '10px 16px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px solid rgba(43,10,46,.1)' }}>Settings</Link>
                      <button onClick={handleLogout} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, color: '#E0007A', background: 'none', border: 'none', cursor: 'pointer' }}>Log out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="font-nunito font-extrabold"
                  style={{ minHeight: 44, padding: '0 20px', display: 'inline-flex', alignItems: 'center', borderRadius: 999, border: '2.5px solid var(--ink)', background: 'white', color: 'var(--ink)', textDecoration: 'none', fontSize: 15 }}
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="font-nunito font-extrabold"
                  style={{ minHeight: 44, padding: '0 20px', display: 'inline-flex', alignItems: 'center', borderRadius: 999, border: '2.5px solid var(--ink)', background: 'var(--pink)', color: 'white', textDecoration: 'none', fontSize: 15, boxShadow: '0 4px 0 var(--ink)' }}
                >
                  Join free ✦
                </Link>
              </>
            )
          )}
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="md:hidden"
          aria-label="Toggle menu"
          style={{ width: 44, height: 44, borderRadius: 10, border: '2.5px solid var(--ink)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20, color: 'var(--ink)', flexShrink: 0 }}
        >
          {mobileOpen ? '×' : '☰'}
        </button>
      </div>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div style={{ background: 'white', borderTop: '2.5px solid var(--ink)', padding: '12px 24px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 16 }}>
            {user && (
              <Link href="/" onClick={() => setMobileOpen(false)} className="font-silkscreen" style={{ display: 'block', padding: '12px 0', fontSize: 15, color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px solid rgba(43,10,46,.1)' }}>Home</Link>
            )}
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="font-silkscreen" style={{ display: 'block', padding: '12px 0', fontSize: 15, color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px solid rgba(43,10,46,.1)' }}>
                {l.label}
              </Link>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {user ? (
              <>
                <Link href={`/profile/${username}`} onClick={() => setMobileOpen(false)} className="font-nunito font-extrabold" style={{ flex: 1, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 999, border: '2.5px solid var(--ink)', background: 'white', color: 'var(--ink)', textDecoration: 'none', fontSize: 15 }}>My page</Link>
                <button onClick={handleLogout} className="font-nunito font-extrabold" style={{ flex: 1, minHeight: 44, borderRadius: 999, border: '2.5px solid var(--ink)', background: 'var(--pink)', color: 'white', cursor: 'pointer', fontSize: 15 }}>Log out</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="font-nunito font-extrabold" style={{ flex: 1, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 999, border: '2.5px solid var(--ink)', background: 'white', color: 'var(--ink)', textDecoration: 'none', fontSize: 15 }}>Log in</Link>
                <Link href="/auth/signup" onClick={() => setMobileOpen(false)} className="font-nunito font-extrabold" style={{ flex: 1, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 999, border: '2.5px solid var(--ink)', background: 'var(--pink)', color: 'white', textDecoration: 'none', fontSize: 15 }}>Join free ✦</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
