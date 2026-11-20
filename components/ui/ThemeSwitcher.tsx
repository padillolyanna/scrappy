'use client'

import { useEffect, useState } from 'react'

type Theme = '' | 'cyber' | 'lilac'

const THEMES: { id: Theme; label: string; color: string; border: string }[] = [
  { id: '', label: 'pink princess', color: '#FF4FA3', border: '#2B0A2E' },
  { id: 'cyber', label: 'cyber y2k', color: '#00CFFF', border: '#00CFFF' },
  { id: 'lilac', label: 'lilac dream', color: '#B87FFF', border: '#5A2090' },
]

export default function ThemeSwitcher() {
  const [current, setCurrent] = useState<Theme>('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('scrappy_theme') as Theme | null
      if (saved !== null) {
        setCurrent(saved)
        if (saved) {
          document.documentElement.dataset.theme = saved
        } else {
          delete document.documentElement.dataset.theme
        }
      }
    } catch { /* ignore */ }
  }, [])

  function setTheme(id: Theme) {
    setCurrent(id)
    if (id) {
      document.documentElement.dataset.theme = id
    } else {
      delete document.documentElement.dataset.theme
    }
    try {
      localStorage.setItem('scrappy_theme', id)
    } catch { /* ignore */ }
  }

  return (
    <div>
      <div
        className="font-chango"
        style={{
          fontFamily: "'Chango', 'Arial Black', sans-serif",
          fontSize: 12,
          color: '#2B0A2E',
          marginBottom: 6,
        }}
      >
        SKIN:
      </div>
      <div className="flex gap-2 items-center flex-wrap">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={t.label}
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: t.color,
              border: `2px solid ${t.border}`,
              cursor: 'pointer',
              outline: current === t.id ? `3px solid #2B0A2E` : '2px solid transparent',
              outlineOffset: '2px',
              transition: 'outline 0.1s',
              flexShrink: 0,
            }}
            aria-label={t.label}
            aria-pressed={current === t.id}
          />
        ))}
      </div>
      <div
        style={{
          fontFamily: "'VT323', monospace",
          fontSize: 12,
          color: '#888',
          marginTop: 4,
        }}
      >
        {THEMES.find((t) => t.id === current)?.label ?? 'pink princess'}
      </div>
    </div>
  )
}
