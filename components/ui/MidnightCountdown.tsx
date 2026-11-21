'use client'

import { useState, useEffect } from 'react'

export default function MidnightCountdown({ style }: { style?: React.CSSProperties }) {
  const [display, setDisplay] = useState<string | null>(null)

  useEffect(() => {
    function calc() {
      const now = new Date()
      const tomorrow = new Date()
      tomorrow.setHours(24, 0, 0, 0)
      const diff = tomorrow.getTime() - now.getTime()
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      const pad = (n: number) => String(n).padStart(2, '0')
      setDisplay(`${pad(h)}:${pad(m)}:${pad(s)}`)
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span
      style={{
        fontFamily: "'Silkscreen', monospace",
        fontSize: 15,
        background: '#0a0a0a',
        color: '#00ff41',
        padding: '2px 8px',
        border: '1px solid #333',
        borderRadius: 3,
        letterSpacing: '0.08em',
        ...style,
      }}
    >
      {display ?? '--:--:--'}
    </span>
  )
}
