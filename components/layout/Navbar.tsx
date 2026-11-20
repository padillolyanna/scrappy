'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/useAuth'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

const GUEST_LINKS = [
  { href: '/', label: 'HOME' },
  { href: '/explore', label: 'EXPLORE' },
  { href: '/highlights', label: 'HIGHLIGHTS' },
  { href: '/confessions', label: 'CONFESSIONS' },
  { href: '/prompts', label: 'DAILY PROMPT' },
  { href: '/photobooth', label: 'PHOTOBOOTH' },
  { href: '/exchange', label: 'EXCHANGE' },
]

const AUTH_LINKS = [
  { href: '/my-space', label: 'HOME' },
  { href: '/explore', label: 'EXPLORE' },
  { href: '/confessions', label: 'CONFESSIONS' },
  { href: '/prompts', label: 'DAILY PROMPT' },
  { href: '/photobooth', label: 'PHOTOBOOTH' },
  { href: '/exchange', label: 'EXCHANGE' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const navLinks = user ? AUTH_LINKS : GUEST_LINKS
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'you'
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const avatarInitial = username.charAt(0).toUpperCase()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b-2 border-[#FFB6D9] shadow-sm overflow-visible">
        <div className="max-w-7xl mx-auto px-4 pt-2 pb-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-pacifico text-glitter" style={{ fontFamily: 'Pacifico, cursive', fontSize: '28px', lineHeight: '1.5', display: 'inline-block' }}>
              SCRAPPY
            </span>
            <span className="text-lg animate-sparkle text-[#FF4FA3]">✦</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-pixel px-3 py-2 rounded-full text-[#3A0030] hover:bg-[#FFB6D9] hover:text-white transition-all duration-200"
                style={{ fontSize: '13px', letterSpacing: '0.05em' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {!loading && (
              user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 font-pixel text-[#3A0030] pl-1 pr-3 py-1 rounded-full border-2 border-[#FFB6D9] hover:border-[#FF4FA3] transition-all"
                    style={{ fontSize: '13px' }}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={username} className="w-7 h-7 rounded-full object-cover border border-[#FFB6D9]" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#FF4FA3] flex items-center justify-center text-white font-pixel" style={{ fontSize: '13px' }}>
                        {avatarInitial}
                      </div>
                    )}
                    <span>@{username}</span>
                    <span className="text-[#888]">▾</span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border-2 border-[#FFB6D9] rounded-xl shadow-lg overflow-hidden z-50">
                      <Link
                        href="/my-space"
                        className="block px-4 py-3 font-pixel text-xs text-[#3A0030] hover:bg-[#FFB6D9]/20 transition-colors border-b border-[#FFB6D9]/30"
                        style={{ fontSize: '13px' }}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        MY SPACE
                      </Link>
                      <Link
                        href={`/profile/${username}`}
                        className="block px-4 py-3 font-pixel text-xs text-[#3A0030] hover:bg-[#FFB6D9]/20 transition-colors border-b border-[#FFB6D9]/30"
                        style={{ fontSize: '13px' }}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        MY PROFILE
                      </Link>
                      <Link
                        href="/scrapbook/create"
                        className="block px-4 py-3 font-pixel text-xs text-[#3A0030] hover:bg-[#FFB6D9]/20 transition-colors border-b border-[#FFB6D9]/30"
                        style={{ fontSize: '13px' }}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        NEW SCRAPBOOK
                      </Link>
                      <button
                        onClick={() => { setUserMenuOpen(false); handleLogout() }}
                        className="block w-full text-left px-4 py-3 font-pixel text-xs text-[#888] hover:bg-[#FFB6D9]/20 transition-colors"
                        style={{ fontSize: '13px' }}
                      >
                        LOG OUT
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="btn-outline-y2k text-xs py-1.5 px-4 whitespace-nowrap"
                    style={{ fontSize: '13px', padding: '6px 16px' }}
                  >
                    LOG IN
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="btn-y2k text-xs py-1.5 px-4 whitespace-nowrap"
                    style={{ fontSize: '13px', padding: '6px 16px' }}
                  >
                    JOIN SCRAPPY ✦
                  </Link>
                </>
              )
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-[#FF4FA3] p-2 font-bold"
          >
            {menuOpen ? 'x' : '='}
          </button>
        </div>

        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-[#FFB6D9] px-4 py-3 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-pixel text-xs text-[#3A0030] py-2 border-b border-[#FFB6D9]/30"
                style={{ fontSize: '14px' }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              {user ? (
                <>
                  <Link
                    href="/my-space"
                    className="btn-y2k text-xs flex-1 text-center"
                    style={{ fontSize: '14px' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    MY SPACE
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); handleLogout() }}
                    className="btn-outline-y2k text-xs flex-1 text-center"
                    style={{ fontSize: '14px' }}
                  >
                    LOG OUT
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="btn-outline-y2k text-xs flex-1 text-center" style={{ fontSize: '14px' }}>LOG IN</Link>
                  <Link href="/auth/signup" className="btn-y2k text-xs flex-1 text-center" style={{ fontSize: '14px' }}>JOIN SCRAPPY</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
