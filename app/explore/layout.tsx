import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Explore Scrapbooks — Scrappy',
  description: 'Browse public digital scrapbooks made by the Scrappy community. Search, sort and discover Y2K-inspired memory pages.',
  alternates: { canonical: 'https://www.scrappy.fun/explore' },
}

export default function ExploreLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
