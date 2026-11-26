import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Confession Wall — Scrappy',
  description: 'Read and share anonymous confessions on the Scrappy community wall. All confessions are moderated before appearing publicly.',
  alternates: { canonical: 'https://www.scrappy.fun/confessions' },
}

export default function ConfessionsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
