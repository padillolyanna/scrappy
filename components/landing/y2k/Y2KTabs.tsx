'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

/* The homepage's purple tab bar. It replaces the site navbar on the logged-out
   homepage, so it carries the same links, with Create and Community as dropdowns. */

type Item = { href: string; label: string; desc?: string }
type Tab = { label: string; href?: string; items?: Item[] }

const TABS: Tab[] = [
  { label: 'Home', href: '/' },
  { label: 'Explore', href: '/explore' },
  {
    label: 'Create',
    items: [
      { href: '/scrapbook/create', label: 'Create Scrapbook', desc: 'Start a new digital journal' },
      { href: '/photobooth', label: 'Photobooth', desc: 'Take and customize photo strips' },
      { href: '/my-space', label: 'My Scrapbooks', desc: 'Manage your collection' },
    ],
  },
  {
    label: 'Community',
    items: [
      { href: '/highlights', label: 'Highlights', desc: 'Featured scrapbooks' },
      { href: '/hangouts', label: 'Journal Hangouts', desc: 'Community get-togethers' },
      { href: '/confessions', label: 'Confession Wall', desc: 'Anonymous confessions' },
      { href: '/prompts', label: 'Daily Prompt', desc: 'Answer the question of the day' },
      { href: '/exchange', label: 'Scrapbook Exchange', desc: 'Exchange notes with others' },
      { href: '/about', label: 'About Scrappy', desc: 'What Scrappy is and how it works' },
      { href: '/contact', label: 'Contact', desc: 'Questions, bugs and reports' },
    ],
  },
  { label: 'Hangouts', href: '/hangouts' },
  { label: 'Prompts', href: '/prompts' },
]

export default function Y2KTabs() {
  const [open, setOpen] = useState<string | null>(null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (!navRef.current?.contains(e.target as Node)) setOpen(null) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <nav ref={navRef} className="y2kh-tabs" aria-label="Main">
      {TABS.map((t) =>
        t.items ? (
          <div key={t.label} className="y2kh-tab-dd">
            <button type="button" aria-expanded={open === t.label} aria-controls={`y2kh-dd-${t.label}`}
              onClick={() => setOpen((o) => (o === t.label ? null : t.label))}>
              {t.label} <span aria-hidden="true">{open === t.label ? '▴' : '▾'}</span>
            </button>
            {open === t.label && (
              <ul id={`y2kh-dd-${t.label}`} className="y2kh-menu">
                {t.items.map((it) => (
                  <li key={it.href + it.label}>
                    <Link href={it.href} onClick={() => setOpen(null)}>
                      <b>{it.label}</b>
                      {it.desc && <span>{it.desc}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <Link key={t.label} href={t.href!} aria-current={t.href === '/' ? 'page' : undefined}>{t.label}</Link>
        ),
      )}
    </nav>
  )
}
