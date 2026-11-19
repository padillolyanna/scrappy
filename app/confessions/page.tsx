'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FloatingElements from '@/components/ui/FloatingElements'
import { motion } from 'framer-motion'
import { useState } from 'react'

const SAMPLE = [
  { text: 'I still listen to my middle school playlist when I need to feel better about life.', category: 'Music', reactions: 234, color: 'bg-[#FFF0A8]' },
  { text: "I pretend I'm confident but I still check if anyone is looking before I do something embarrassing.", category: 'Life', reactions: 189, color: 'bg-[#FFD6EC]' },
  { text: "I still have the first ever text message my best friend sent me saved on my old phone.", category: 'Friendship', reactions: 312, color: 'bg-[#D6EDFF]' },
  { text: "Sometimes I cry in the car just to get it out before I walk back inside.", category: 'Feelings', reactions: 445, color: 'bg-[#E8D6FF]' },
  { text: "I still write letters I never send. I have a whole box of them under my bed.", category: 'Love', reactions: 278, color: 'bg-[#FFF0A8]' },
  { text: "I cry at strangers' graduations, weddings, and homecomings at the airport.", category: 'Random', reactions: 156, color: 'bg-[#FFD6EC]' },
  { text: "My biggest regret is not saying 'I love you' more to the people who deserved to hear it.", category: 'Regrets', reactions: 521, color: 'bg-[#D6EDFF]' },
  { text: "I keep all the birthday cards I've ever received. I reread them when I feel alone.", category: 'Life', reactions: 388, color: 'bg-[#E8D6FF]' },
]

const CATEGORIES = ['All', 'Love', 'Friendship', 'Life', 'Feelings', 'Random', 'Regrets', 'Music']

export default function ConfessionsPage() {
  const [confession, setConfession] = useState('')
  const [category, setCategory] = useState('All')
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="flex flex-col min-h-screen relative">
      <FloatingElements count={8} />
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="font-pixel text-xs text-[#C9B6FF] mb-2 tracking-widest" style={{ fontSize: '11px' }}>
              ✦ ANONYMOUS CONFESSIONS ✦
            </div>
            <h1 className="font-pacifico text-5xl text-[#3A0030] mb-3" style={{ fontFamily: 'Pacifico, cursive', fontSize: 'clamp(32px, 7vw, 52px)' }}>
              the confession wall
            </h1>
            <p className="font-caveat text-xl text-[#888]" style={{ fontFamily: 'Caveat, cursive' }}>
              say the thing you've never said out loud
            </p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-[#FFD6EC] rounded-2xl p-8 text-center mb-10 border-2 border-[#FFB6D9]"
            >
              <div className="text-4xl font-pixel text-[#FF4FA3] mb-2">✦</div>
              <div className="font-pacifico text-2xl text-[#3A0030]" style={{ fontFamily: 'Pacifico, cursive' }}>pinned to the wall!</div>
              <div className="font-caveat text-lg text-[#888]" style={{ fontFamily: 'Caveat, cursive' }}>your confession has been shared anonymously ✦</div>
              <button onClick={() => { setSubmitted(false); setConfession('') }} className="btn-y2k mt-4">share another</button>
            </motion.div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-[#FFB6D9]/50 p-6 mb-10 shadow-lg">
              <div className="font-pixel text-xs text-[#3A0030] mb-3" style={{ fontSize: '10px' }}>SHARE YOUR CONFESSION (anonymously)</div>
              <textarea
                value={confession}
                onChange={(e) => setConfession(e.target.value)}
                placeholder="write what's on your mind... no judgment here"
                className="input-y2k resize-none font-caveat w-full mb-3"
                rows={3}
                style={{ fontFamily: 'Caveat, cursive', fontSize: '18px' }}
              />
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-2 flex-wrap">
                  {['Love', 'Friendship', 'Life', 'Random'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`font-pixel text-xs px-3 py-1 rounded-full border transition-all ${category === cat ? 'bg-[#FF4FA3] border-[#FF4FA3] text-white' : 'border-[#FFB6D9] text-[#3A0030]'}`}
                      style={{ fontSize: '9px' }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => confession.trim() && setSubmitted(true)}
                  disabled={!confession.trim()}
                  className="btn-y2k"
                >
                  pin it
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2 mb-6 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`font-pixel text-xs px-3 py-1.5 rounded-full border-2 transition-all ${category === cat ? 'bg-[#3A0030] border-[#3A0030] text-white' : 'border-[#FFB6D9] text-[#3A0030] bg-white'}`}
                style={{ fontSize: '9px' }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {SAMPLE.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`${c.color} p-5 break-inside-avoid relative`}
                style={{ transform: `rotate(${(i % 3 - 1) * 1.5}deg)`, borderRadius: '2px', boxShadow: '3px 3px 8px rgba(0,0,0,0.12)' }}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#FF4FA3] shadow-md" />
                <div className="font-caveat text-lg text-[#3A0030] leading-snug mb-3 mt-2" style={{ fontFamily: 'Caveat, cursive', fontSize: '17px' }}>
                  "{c.text}"
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-xs text-[#888]" style={{ fontSize: '9px' }}>{c.category}</span>
                  <div className="flex items-center gap-1 font-nunito text-xs text-[#888]">
                    <button className="hover:scale-125 transition-transform">♡</button>
                    <span>{c.reactions}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
