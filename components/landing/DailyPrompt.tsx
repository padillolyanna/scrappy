'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const SAMPLE_ANSWERS = [
  {
    user: 'stargazer',
    answer: 'The songs my family played during long car rides. They always bring back memories.',
    likes: 42,
    avatar: 'from-pink-400 to-purple-400',
  },
  {
    user: 'nostalgiaxo',
    answer: 'Definitely the songs I listened to during my childhood. I still remember every word.',
    likes: 87,
    avatar: 'from-blue-400 to-teal-400',
  },
  {
    user: 'melodydream',
    answer: 'Classic Coldplay and Avril Lavigne. I used to listen to them all the time!',
    likes: 56,
    avatar: 'from-yellow-400 to-orange-400',
  },
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
    <div className="inline-flex items-center gap-2 font-pixel text-[#FFB6D9]/60 mt-4" style={{ fontSize: '10px' }}>
      <span>NEXT PROMPT IN:</span>
      <span className="bg-white/10 border border-[#FFB6D9]/30 text-[#FFB6D9] px-3 py-1 rounded-full">
        {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
      </span>
    </div>
  )
}

export default function DailyPrompt() {
  const [answer, setAnswer] = useState('')

  return (
    <section
      className="py-16 lg:py-20 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #2A0028 0%, #100030 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-[55%_45%] gap-10 items-start">
          {/* LEFT COLUMN */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="font-pixel text-[#FFB6D9]/60 tracking-widest mb-2" style={{ fontSize: '10px' }}>
              TODAY'S QUESTION
            </div>
            <h2 className="font-pacifico text-4xl text-white" style={{ fontFamily: 'Pacifico, cursive' }}>
              Daily Scrapbook Prompt
            </h2>

            {/* Featured question card */}
            <div className="bg-white/10 border border-[#FFB6D9]/20 rounded-2xl p-6 my-6">
              <p className="font-caveat text-2xl text-[#FFB6D9]" style={{ fontFamily: 'Caveat, cursive' }}>
                "What song instantly takes you back to your childhood?"
              </p>
            </div>

            {/* Answer textarea */}
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="write your answer here..."
              rows={3}
              className="w-full rounded-xl px-4 py-3 resize-none font-caveat text-base mb-4 focus:outline-none focus:ring-2 focus:ring-[#FFB6D9]/40"
              style={{
                fontFamily: 'Caveat, cursive',
                fontSize: '17px',
                background: 'rgba(255,255,255,0.08)',
                border: '1.5px solid rgba(255,182,217,0.3)',
                color: 'white',
              }}
            />

            {/* Buttons */}
            <div className="flex gap-3 flex-wrap">
              <button className="btn-y2k">
                Submit Answer
              </button>
              <button
                className="border-2 rounded-full px-5 py-2 font-nunito font-bold text-sm transition-all hover:bg-white/10"
                style={{ borderColor: 'rgba(255,182,217,0.4)', color: '#FFB6D9' }}
              >
                + ADD TO SCRAPBOOK
              </button>
            </div>

            {/* Countdown */}
            <Countdown />
          </motion.div>

          {/* RIGHT COLUMN */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="font-pixel text-[#FFB6D9]/60 tracking-widest mb-4" style={{ fontSize: '10px' }}>
              2,184 ANSWERS TODAY
            </div>

            <div className="space-y-3">
              {SAMPLE_ANSWERS.map((a, i) => (
                <div
                  key={i}
                  className="bg-white/10 border border-[#FFB6D9]/20 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${a.avatar} shrink-0`} />
                    <span className="text-[#FFB6D9] font-bold font-nunito text-sm">@{a.user}</span>
                  </div>
                  <p
                    className="font-caveat text-lg text-white/80 line-clamp-3"
                    style={{ fontFamily: 'Caveat, cursive' }}
                  >
                    {a.answer}
                  </p>
                  <div className="mt-2 font-nunito text-xs text-[#FFB6D9]/50">
                    ♡ {a.likes}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Link
                href="/prompts"
                className="font-pixel text-[#FFB6D9]/60 hover:text-[#FFB6D9] transition-colors"
                style={{ fontSize: '10px' }}
              >
                READ ALL 2,184 ANSWERS →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
