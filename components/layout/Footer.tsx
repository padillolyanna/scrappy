'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Explore', href: '/explore' },
  { label: 'Create Scrapbook', href: '/scrapbook/create' },
  { label: 'Photobooth', href: '/photobooth' },
  { label: 'Highlights', href: '/highlights' },
  { label: 'Confession Wall', href: '/confessions' },
  { label: 'Daily Prompt', href: '/prompts' },
  { label: 'Journal Hangouts', href: '/hangouts' },
  { label: 'Scrapbook Exchange', href: '/exchange' },
  { label: 'The Journal', href: '/journal' },
]

const INFO_LINKS = [
  { label: 'About Scrappy', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/tos' },
  { label: 'Community Guidelines', href: '/community-guidelines' },
  { label: 'Copyright', href: '/copyright' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
]

export default function Footer({ always = false }: { always?: boolean } = {}) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setLoggedIn(!!user)
    })
  }, [])

  if (!always && (loggedIn === null || loggedIn)) return null

  return (
    <footer className="y2kh-foot y2k-footer">
      <div className="y2kh-dots" aria-hidden="true" />
      <div className="y2k-footer-cols">
        <div>
          <div className="y2k-footer-logo">scrappy<span>.fun</span></div>
          <p>Your little corner of the internet ✦</p>
        </div>
        <nav aria-label="Explore">
          <b>EXPLORE</b>
          {NAV_LINKS.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
        <nav aria-label="Info">
          <b>INFO</b>
          {INFO_LINKS.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
      </div>
      <div className="y2kh-badges" aria-label="Web badges">
        {/* eslint-disable @next/next/no-img-element */}
        <img src="/y2k/badge-scrappy.gif" width={88} height={31} alt="Scrappy, est. 2026" className="y2kh-px" />
        <img src="/y2k/badge-made-with-love.gif" width={88} height={31} alt="made with love and glitter" className="y2kh-px" />
        <img src="/y2k/badge-no-ads-pages.gif" width={88} height={31} alt="no ads in your pages" className="y2kh-px" />
        <img src="/y2k/badge-any-screen.gif" width={88} height={31} alt="best viewed on any screen" className="y2kh-px" />
        {/* eslint-enable @next/next/no-img-element */}
      </div>
      <p>© 2026 Scrappy. All rights reserved.</p>
    </footer>
  )
}
