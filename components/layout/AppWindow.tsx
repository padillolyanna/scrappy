'use client'

import { Suspense, type ReactNode } from 'react'
import Footer from './Footer'
import PageWindowTitle from './PageWindowTitle'

interface Props {
  children: ReactNode
}

// Edge sparkles
const SPARKLES = [
  { top: '8px', left: '20px', delay: '0s', size: '14px' },
  { top: '8px', right: '24px', delay: '0.6s', size: '10px' },
  { bottom: '40px', left: '14px', delay: '1.2s', size: '12px' },
  { bottom: '40px', right: '16px', delay: '1.8s', size: '8px' },
  { top: '50%', left: '6px', delay: '2.4s', size: '10px' },
  { top: '30%', right: '4px', delay: '0.9s', size: '12px' },
]

export default function AppWindow({ children }: Props) {
  return (
    <div className="y2k-frame w-full max-w-[960px] relative mt-0">
      {/* Outer sparkle decorations around the window frame */}
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="y2k-edge-spark absolute font-pixel text-[#FF4FA3] pointer-events-none select-none animate-twinkle"
          style={{
            top: s.top,
            left: (s as { left?: string }).left,
            right: (s as { right?: string }).right,
            bottom: s.bottom,
            fontSize: s.size,
            animationDelay: s.delay,
            zIndex: 30,
          }}
        >
          ✦
        </span>
      ))}

      {/* Main window body */}
      <div
        className="relative y2k-app"
        style={{
          background: 'var(--c-bg, #FFF0F7)',
          border: '3px solid #2B0A2E',
          borderRadius: '0 0 14px 14px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 4px 8px 20px rgba(0,0,0,0.4)',
          minHeight: '400px',
          overflow: 'visible',
        }}
      >
        {/* Themed pages get the homepage's frame: glitter-check backdrop, one
            window with a title bar, a status bar and the shared footer. Pages
            marked data-y2k-off (profile, scrapbook editor, home) hide all of
            this through CSS and keep their own look. */}
        <div className="y2k-pagebody">
          <div className="y2k-pagewin">
            <div className="y2kh-ttl y2kh-ttl--pink y2k-pagewin-ttl" aria-hidden="true">
              <span className="y2kh-ttl-text">
                <Suspense fallback="✦ scrappy.exe"><PageWindowTitle /></Suspense>
              </span>
              <span className="y2kh-winbtns"><i>_</i><i>□</i><i>×</i></span>
            </div>
            <div className="y2k-pagewin-in">{children}</div>
            <div className="y2k-statusbar" aria-hidden="true">
              <span>✦ done</span>
              <span>scrappy.fun</span>
              <span className="y2k-statusbar-zone">♡ internet zone</span>
            </div>
          </div>
        </div>
        <div className="y2k-shellfoot"><Footer always /></div>
      </div>
    </div>
  )
}
