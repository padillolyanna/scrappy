'use client'

import type { ReactNode } from 'react'
import Mascot from '@/components/ui/Mascot'

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
    <div className="w-full max-w-[960px] relative mt-0">
      {/* Outer sparkle decorations around the window frame */}
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="absolute font-pixel text-[#FF4FA3] pointer-events-none select-none animate-twinkle"
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
        className="relative"
        style={{
          background: 'var(--c-bg, #FFF0F7)',
          border: '3px solid #2B0A2E',
          borderRadius: '0 0 14px 14px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 4px 8px 20px rgba(0,0,0,0.4)',
          minHeight: '400px',
          overflow: 'visible',
        }}
      >
        {children}

        {/* Mascot in lower-right corner of the window */}
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            right: '-20px',
            zIndex: 20,
          }}
        >
          <Mascot />
        </div>
      </div>
    </div>
  )
}
