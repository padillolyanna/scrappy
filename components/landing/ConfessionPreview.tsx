'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const CONFESSIONS = [
  { text: 'I still listen to my middle school playlist when I need to feel better about life.', category: 'Music', reactions: 234, color: 'bg-[#FFF0A8]', rotate: '-2deg' },
  { text: "I pretend I'm confident but I still check if anyone is looking before I do something embarrassing.", category: 'Life', reactions: 189, color: 'bg-[#FFD6EC]', rotate: '1.5deg' },
  { text: "I still have the first ever text message my best friend sent me saved on my old phone.", category: 'Friendship', reactions: 312, color: 'bg-[#D6EDFF]', rotate: '-1deg' },
  { text: 'Sometimes I cry in the car just to get it out before I walk back inside.', category: 'Feelings', reactions: 445, color: 'bg-[#E8D6FF]', rotate: '2.5deg' },
  { text: "I still write letters I never send. I have a whole box of them under my bed.", category: 'Love', reactions: 278, color: 'bg-[#FFF0A8]', rotate: '-1.5deg' },
  { text: "I cry at strangers' graduations, weddings, and homecomings at the airport.", category: 'Random', reactions: 156, color: 'bg-[#FFD6EC]', rotate: '1deg' },
]

export default function ConfessionPreview() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="font-pixel text-xs text-[#C9B6FF] mb-2 tracking-widest" style={{ fontSize: '11px' }}>
              ✦ ANONYMOUS CONFESSIONS ✦
            </div>
            <h2
              className="font-pacifico text-5xl text-[#3A0030]"
              style={{ fontFamily: 'Pacifico, cursive', fontSize: 'clamp(28px, 5vw, 48px)' }}
            >
              the confession wall
            </h2>
            <div className="mt-2 font-caveat text-lg text-[#888]" style={{ fontFamily: 'Caveat, cursive' }}>
              say the thing you've never said out loud
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CONFESSIONS.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.03, rotate: 0, zIndex: 10 }}
              className={`${c.color} p-5 shadow-md relative cursor-pointer`}
              style={{ transform: `rotate(${c.rotate})`, borderRadius: '2px', boxShadow: '3px 3px 8px rgba(0,0,0,0.12)' }}
            >
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#FF4FA3] shadow-md" />

              <div
                className="font-caveat text-lg text-[#3A0030] leading-snug mb-3 mt-2"
                style={{ fontFamily: 'Caveat, cursive', fontSize: '17px' }}
              >
                "{c.text}"
              </div>

              <div className="flex items-center justify-between">
                <span className="font-pixel text-xs text-[#888]" style={{ fontSize: '9px' }}>
                  {c.category}
                </span>
                <div className="flex items-center gap-1 font-nunito text-xs text-[#888]">
                  <button className="hover:scale-125 transition-transform text-sm">♡</button>
                  <span>{c.reactions}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link href="/confessions" className="btn-y2k">
            share your confession
          </Link>
          <Link href="/confessions" className="btn-outline-y2k">
            read all confessions
          </Link>
        </div>
      </div>
    </section>
  )
}
