'use client'

import Link from 'next/link'
import { useState } from 'react'

const NAV_LINKS = [
  { href: '/', label: 'HOME' },
  { href: '/scrapbook/create', label: 'MY SCRAPBOOK' },
  { href: '/explore', label: 'EXPLORE' },
  { href: '/highlights', label: 'HIGHLIGHTS' },
  { href: '/confessions', label: 'CONFESSIONS' },
  { href: '/prompts', label: 'DAILY PROMPT' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <div className="bg-[#3A0030] text-[#FFB6D9] font-pixel text-xs py-1 px-4 flex items-center justify-between" style={{ fontSize: '11px' }}>
        <span>✦ SCRAPPY v2.0 — loading your nostalgia... ✦</span>
        <span className="hidden sm:block">made with love</span>
      </div>

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b-2 border-[#FFB6D9] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span
              className="font-pacifico text-3xl text-glitter"
              style={{ fontFamily: 'Pacifico, cursive', fontSize: '28px' }}
            >
              SCRAPPY
            </span>
            <span className="text-lg animate-sparkle text-[#FF4FA3]">✦</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-pixel text-xs px-3 py-2 rounded-full text-[#3A0030] hover:bg-[#FFB6D9] hover:text-white transition-all duration-200"
                style={{ fontSize: '10px', letterSpacing: '0.08em' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/auth/login"
              className="btn-outline-y2k text-xs py-1.5 px-4"
              style={{ fontSize: '12px', padding: '6px 16px' }}
            >
              LOG IN
            </Link>
            <Link
              href="/auth/signup"
              className="btn-y2k text-xs py-1.5 px-4"
              style={{ fontSize: '12px', padding: '6px 16px' }}
            >
              SIGN UP ✦
            </Link>
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
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-pixel text-xs text-[#3A0030] py-2 border-b border-[#FFB6D9]/30"
                style={{ fontSize: '11px' }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <Link href="/auth/login" className="btn-outline-y2k text-xs flex-1 text-center" style={{ fontSize: '11px' }}>LOG IN</Link>
              <Link href="/auth/signup" className="btn-y2k text-xs flex-1 text-center" style={{ fontSize: '11px' }}>SIGN UP</Link>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
