import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '404 — Page not found | Scrappy',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 px-4 text-center">
      <div
        className="font-pixel text-[80px] leading-none text-[#FF4FA3] mb-2"
        style={{ fontFamily: 'VT323, monospace', textShadow: '3px 3px 0 #3A0030' }}
        aria-hidden="true"
      >
        404
      </div>
      <div
        className="font-pixel text-xs text-[#C9A2FF] tracking-widest mb-4"
        style={{ fontSize: '11px' }}
      >
        ✦ PAGE NOT FOUND ✦
      </div>
      <h1
        className="font-pacifico text-3xl text-[#3A0030] mb-3"
        style={{ fontFamily: 'Pacifico, cursive' }}
      >
        this page ran away
      </h1>
      <p
        className="font-caveat text-xl text-[#888] max-w-sm mb-8"
        style={{ fontFamily: 'Caveat, cursive' }}
      >
        it might have been deleted, moved or the link might have a typo. don&apos;t worry, there&apos;s lots more to explore!
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/" className="btn-y2k">
          go home
        </Link>
        <Link href="/explore" className="btn-outline-y2k">
          explore scrapbooks
        </Link>
      </div>
    </div>
  )
}
