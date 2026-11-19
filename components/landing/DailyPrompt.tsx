'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const TODAY_PROMPT = "What's one memory you wish you could relive?"

const SAMPLE_ANSWERS = [
  { author: 'stargirl404', text: 'The last summer before high school. Everything felt possible and nothing felt permanent yet.', likes: 42 },
  { author: 'melodydreamer', text: "My grandma teaching me to bake her secret cookie recipe. She's gone now but I still make them every Christmas.", likes: 87 },
  { author: 'nostalgiaxo', text: 'Road trip with my best friends at 3am singing every word to every song. Pure freedom.', likes: 56 },
]

function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 })

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
    setTimeLeft(calc())
    const id = setInterval(() => setTimeLeft(calc()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-2 font-pixel text-xs text-[#888]" style={{ fontSize: '11px' }}>
      <span>next prompt in:</span>
      <span className="bg-[#3A0030] text-[#FFB6D9] px-2 py-0.5 rounded">
        {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
      </span>
    </div>
  )
}

export default function DailyPrompt() {
  const [answer, setAnswer] = useState('')

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="paper-texture rounded-2xl p-8 relative border-2 border-[#A8DFFF]/50 shadow-lg">
            <div className="absolute left-0 top-6 bottom-6 w-10 flex flex-col justify-around items-center">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-5 h-5 rounded-full bg-[#C9B6FF]/60 border-2 border-[#A8DFFF]" />
              ))}
            </div>

            <div className="ml-8">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <div className="font-pixel text-xs text-[#FF4FA3] mb-1 tracking-widest" style={{ fontSize: '11px' }}>
                    ✦ TODAY'S QUESTION ✦
                  </div>
                  <Countdown />
                </div>
                <div className="text-4xl animate-sparkle text-[#C9B6FF]">✦</div>
              </div>

              <h3
                className="font-caveat text-3xl text-[#3A0030] mb-6 leading-tight"
                style={{ fontFamily: 'Caveat, cursive', fontSize: '32px' }}
              >
                "{TODAY_PROMPT}"
              </h3>

              <div className="flex gap-2 mb-6">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="share your answer..."
                  className="input-y2k resize-none font-caveat flex-1"
                  rows={2}
                  style={{ fontFamily: 'Caveat, cursive', fontSize: '16px' }}
                />
                <button className="btn-y2k px-4 self-stretch" disabled={!answer.trim()}>
                  send ✦
                </button>
              </div>

              <div className="space-y-3">
                <div className="font-pixel text-xs text-[#888] mb-2" style={{ fontSize: '10px' }}>
                  — COMMUNITY ANSWERS (87) —
                </div>
                {SAMPLE_ANSWERS.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/60 rounded-xl p-3 border border-[#FFB6D9]/40"
                  >
                    <div className="font-nunito text-xs text-[#FF4FA3] font-bold mb-1">@{a.author}</div>
                    <div
                      className="font-caveat text-lg text-[#3A0030]"
                      style={{ fontFamily: 'Caveat, cursive', fontSize: '17px' }}
                    >
                      {a.text}
                    </div>
                    <div className="mt-1 flex items-center gap-1 font-nunito text-xs text-[#888]">
                      <button className="hover:scale-125 transition-transform">♡</button>
                      <span>{a.likes}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <Link href="/prompts" className="font-pixel text-xs text-[#FF4FA3] hover:underline" style={{ fontSize: '11px' }}>
                  see all answers + past prompts
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
