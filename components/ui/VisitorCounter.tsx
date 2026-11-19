'use client'

import { useEffect, useState } from 'react'

export default function VisitorCounter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const base = 48291
    const random = Math.floor(Math.random() * 999)
    setCount(base + random)
  }, [])

  const digits = count.toString().padStart(6, '0').split('')

  return (
    <div className="inline-flex items-center gap-2">
      <span className="font-pixel text-xs text-[#888]" style={{ fontSize: '11px' }}>
        VISITORS:
      </span>
      <div className="flex gap-0.5 items-center">
        {digits.map((d, i) => (
          <span key={i} className="counter-digit">
            {d}
          </span>
        ))}
      </div>
    </div>
  )
}
