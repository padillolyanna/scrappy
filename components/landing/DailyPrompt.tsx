'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const SAMPLE_ANSWERS = [
  {
    user: 'stargazer',
    answer: 'The songs my family played during long car rides. They always bring back memories.',
    likes: 42,
  },
  {
    user: 'nostalgiaxo',
    answer: 'Definitely the songs I listened to during my childhood. I still remember every word.',
    likes: 87,
  },
  {
    user: 'melodydream',
    answer: 'Classic Coldplay and Avril Lavigne. I used to listen to them all the time!',
    likes: 56,
  },
]

function Countdown() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 })

  useEffect(() => {
    function calc() {
      const now = new Date()
      const tomorrow = new Date()
      tomorrow.setHours(24, 0, 0, 0)
      const diff = tomorrow.getTime() - now.getTime()
      return {
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      }
    }
    setTime(calc())
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

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
      }}
    >
      {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
    </span>
  )
}

export default function DailyPrompt() {
  const [answer, setAnswer] = useState('')

  return (
    <section style={{ padding: '0 20px 20px' }}>
      <div className="panel-header">
        today&apos;s prompt ✎
      </div>
      <div className="widget-box" style={{ padding: 0 }}>
        <div className="grid md:grid-cols-[55%_45%]">

          {/* LEFT: Notebook card */}
          <div
            style={{
              background: '#FFF8ED',
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 27px,
                  rgba(100,160,220,0.25) 27px,
                  rgba(100,160,220,0.25) 28px
                )
              `,
              borderRight: '1px solid rgba(201,182,255,0.3)',
              padding: '16px 16px 16px 52px',
              position: 'relative',
            }}
          >
            {/* Red margin line */}
            <div style={{
              position: 'absolute',
              left: 36,
              top: 0, bottom: 0,
              width: 2,
              background: 'rgba(255,100,100,0.5)',
            }} />

            {/* Spiral binding dots */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 10,
                  top: `${i * 36 + 18}px`,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#C9A2FF',
                  border: '1.5px solid #2B0A2E',
                }}
              />
            ))}

            {/* Question with highlight */}
            <div
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 20,
                color: '#3A0030',
                lineHeight: 1.5,
                marginBottom: 14,
                display: 'inline',
              }}
            >
              <span style={{ background: 'rgba(255,200,0,0.4)', padding: '0 2px' }}>
                "What song instantly takes you back to your childhood?"
              </span>
            </div>

            {/* Answer textarea */}
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="write your answer here..."
              rows={3}
              style={{
                width: '100%',
                borderRadius: 4,
                padding: '8px 10px',
                resize: 'none',
                fontFamily: "'Caveat', cursive",
                fontSize: 16,
                background: 'white',
                border: '2px solid #C9A2FF',
                outline: 'none',
                boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.1)',
                color: '#3A0030',
                display: 'block',
                marginBottom: 10,
              }}
            />

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              <button className="btn-bevel" style={{ fontSize: 12, padding: '6px 14px' }}>
                submit ✎
              </button>
              <button
                style={{
                  fontFamily: "'Chango', 'Arial Black', sans-serif",
                  fontSize: 11,
                  color: '#FF4FA3',
                  background: '#FFF0F7',
                  border: '2px solid #FFB6D9',
                  borderRadius: 20,
                  padding: '5px 12px',
                  cursor: 'pointer',
                }}
              >
                + add to scrapbook
              </button>
            </div>

            <div style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: '#aaa', display: 'flex', alignItems: 'center', gap: 8 }}>
              NEXT PROMPT IN: <Countdown />
            </div>
          </div>

          {/* RIGHT: Recent answers */}
          <div style={{ padding: '14px', background: 'white' }}>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: '#888', marginBottom: 8 }}>
              2,184 ANSWERS TODAY
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SAMPLE_ANSWERS.map((a, i) => (
                <div
                  key={i}
                  className="sticky-note"
                  style={{
                    background: ['#FFF0A8', '#FFD6EC', '#D6EDFF'][i],
                    padding: '8px 10px',
                    borderRadius: 2,
                    transform: `rotate(${[-1, 1, -0.5][i]}deg)`,
                  }}
                >
                  <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 11, fontWeight: 'bold', color: '#FF4FA3', marginBottom: 3 }}>
                    @{a.user}
                  </div>
                  <p style={{ fontFamily: "'Caveat', cursive", fontSize: 14, color: '#3A0030', lineHeight: 1.4 }}>
                    {a.answer}
                  </p>
                  <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 10, color: '#aaa', marginTop: 4 }}>
                    ♡ {a.likes}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 10 }}>
              <Link
                href="/prompts"
                style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: '#FF4FA3', textDecoration: 'underline' }}
              >
                READ ALL 2,184 ANSWERS →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
