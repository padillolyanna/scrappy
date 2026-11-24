import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Scrapbook Exchange — Scrappy',
  description: 'Swap answers to the same questions with a friend or a stranger. Reveal together and turn the exchange into a shared scrapbook page.',
}

export default function ExchangeLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
