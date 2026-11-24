import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Highlights — Scrappy',
  description: 'Vote for your favourite scrapbooks in the Scrappy community Highlights. Daily and weekly categories — one vote per category per period.',
}

export default function HighlightsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
