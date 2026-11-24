'use client'

import { usePathname } from 'next/navigation'

// Window-title names for the page frame, e.g. "/explore" → "explore.exe"
const NAMES: Record<string, string> = {
  explore: 'explore.exe',
  confessions: 'confession_wall.exe',
  prompts: 'daily_prompt.exe',
  hangouts: 'journal_hangouts.exe',
  highlights: 'highlights.exe',
  photobooth: 'photobooth.exe',
  exchange: 'scrapbook_exchange.exe',
  journal: 'the_journal.txt',
  about: 'about_scrappy.txt',
  faq: 'faq.txt',
  contact: 'contact_me.exe',
  'my-space': 'my_space.exe',
  pet: 'my_little_pet.exe',
  notifications: 'inbox.exe',
  messages: 'messages.exe',
  settings: 'settings.exe',
}

const ICONS: Record<string, string> = {
  confessions: '♡', prompts: '✎', hangouts: '☕', photobooth: '📷', exchange: '✉', pet: '♡', journal: '✎',
}

export function pageKey(pathname: string) {
  return pathname.split('/').filter(Boolean)[0] ?? ''
}

export default function PageWindowTitle() {
  const key = pageKey(usePathname() ?? '')
  const name = NAMES[key] ?? (key ? `${key.replace(/-/g, '_')}.html` : 'scrappy.exe')
  return <>{ICONS[key] ?? '✦'} {name}</>
}
