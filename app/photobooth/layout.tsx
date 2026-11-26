import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Photobooth — Scrappy',
  description: 'Take Y2K-style photo strips with your webcam. Choose layouts, add frames and filters, decorate with stickers and download your strip.',
  alternates: { canonical: 'https://www.scrappy.fun/photobooth' },
}

export default function PhotoboothLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
