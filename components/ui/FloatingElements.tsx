'use client'

import { useEffect, useState } from 'react'

interface FloatingItem {
  id: number
  symbol: string
  x: number
  y: number
  size: number
  delay: number
  duration: number
  rotation: number
}

const SYMBOLS = ['✦', '★', '♡', '✿', '♪', '◆', '●', '✸', '❋', '⊹', '✾', '✽', '☆', '◎', '⌒']

export default function FloatingElements({ count = 15 }: { count?: number }) {
  const [items, setItems] = useState<FloatingItem[]>([])

  useEffect(() => {
    setItems(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        symbol: SYMBOLS[i % SYMBOLS.length],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 16 + 10,
        delay: Math.random() * 4,
        duration: Math.random() * 3 + 3,
        rotation: Math.random() * 360,
      }))
    )
  }, [count])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {items.map((item) => (
        <span
          key={item.id}
          style={{
            position: 'absolute',
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: `${item.size}px`,
            opacity: 0.35,
            animationName: item.id % 3 === 0 ? 'float' : item.id % 3 === 1 ? 'float2' : 'float3',
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out',
            transform: `rotate(${item.rotation}deg)`,
            color: ['#FF4FA3', '#C9B6FF', '#A8DFFF', '#FFB6D9', '#FFF0A8'][item.id % 5],
          }}
        >
          {item.symbol}
        </span>
      ))}
    </div>
  )
}
