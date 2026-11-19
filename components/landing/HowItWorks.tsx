'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const STEPS = [
  {
    number: '01',
    symbol: '✦',
    title: 'Pick your cover',
    description: 'Choose from 8 unique Y2K-inspired cover themes to set the vibe for your scrapbook.',
    color: 'bg-[#FFB6D9]/30 border-[#FF4FA3]',
  },
  {
    number: '02',
    symbol: '♡',
    title: 'Answer the prompts',
    description: 'Fill out ready-made templates — About Me, Friendship, 2000s Diary, and more.',
    color: 'bg-[#C9B6FF]/30 border-[#C9B6FF]',
  },
  {
    number: '03',
    symbol: '✸',
    title: 'Decorate your pages',
    description: 'Add stickers, photos, doodles, and decorations. Drag, rotate, resize everything.',
    color: 'bg-[#A8DFFF]/30 border-[#A8DFFF]',
  },
  {
    number: '04',
    symbol: '◆',
    title: 'Share with the world',
    description: 'Publish publicly, share a link with friends, or keep it private. Your scrapbook, your rules.',
    color: 'bg-[#FFF0A8]/50 border-[#FFD700]',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-16 px-4 bg-[#3A0030] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none select-none">
        {['✦', '★', '♡', '✿', '♪'].map((sym, i) => (
          <span
            key={i}
            className="absolute text-white text-6xl"
            style={{ top: `${[10, 70, 30, 60, 85][i]}%`, left: `${[5, 20, 50, 75, 90][i]}%` }}
          >
            {sym}
          </span>
        ))}
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="font-pixel text-xs text-[#FFB6D9] mb-2 tracking-widest" style={{ fontSize: '11px' }}>
            ✦ HOW IT WORKS ✦
          </div>
          <h2
            className="font-pacifico text-white"
            style={{ fontFamily: 'Pacifico, cursive', fontSize: 'clamp(28px, 5vw, 48px)' }}
          >
            make your scrapbook in minutes
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`${step.color} border-2 rounded-2xl p-6 relative`}
            >
              <div className="font-press text-xs text-white/30 mb-3" style={{ fontSize: '10px' }}>
                {step.number}
              </div>
              <div className="text-4xl mb-3 font-pixel text-white/60">{step.symbol}</div>
              <h3 className="font-nunito font-900 text-white text-lg mb-2 font-black">
                {step.title}
              </h3>
              <p className="font-nunito text-white/70 text-sm leading-relaxed">
                {step.description}
              </p>

              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 text-white/30 text-2xl z-10">
                  →
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/scrapbook/create" className="btn-y2k text-lg px-10 py-4 inline-flex items-center gap-2">
            ✦ start your scrapbook now
          </Link>
        </div>
      </div>
    </section>
  )
}
