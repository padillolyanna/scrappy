import type { ReactNode } from 'react'

// These pages keep their own look (user-themed profiles, the scrapbook editor and viewer),
// so they opt out of the site-wide Y2K theme layer in globals.css.
export default function Layout({ children }: { children: ReactNode }) {
  return <div data-y2k-off style={{ display: 'contents' }}>{children}</div>
}
