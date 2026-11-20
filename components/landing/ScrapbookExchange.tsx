'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const STEPS = [
  'Choose a template and answer 10 community questions.',
  'Get matched with someone who answered the same set.',
  'Reveal answers together and find your similarities.',
  'Create a friendship scrapbook page from your exchange.',
]

export default function ScrapbookExchange() {
  return (
    <section className="py-16 lg:py-20 bg-[#FFF8ED] border-t-2 border-[#FFB6D9]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT COLUMN — Visual cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* NEW FEATURE badge */}
            <div className="inline-block bg-[#FF4FA3] text-white font-pixel px-3 py-1 rounded-full mb-6" style={{ fontSize: '9px' }}>
              NEW FEATURE
            </div>

            {/* Overlapping cards */}
            <div className="relative h-80">
              {/* Card 1 — behind */}
              <div
                className="absolute left-0 top-0 w-64 bg-white rounded-xl shadow-lg p-5 border-2 border-[#FFB6D9]"
                style={{ transform: 'rotate(-6deg)' }}
              >
                <div className="font-pixel text-[#888] mb-3" style={{ fontSize: '9px' }}>
                  EXCHANGE QUESTIONS
                </div>
                <div className="font-caveat text-lg text-[#3A0030] mb-2" style={{ fontFamily: 'Caveat, cursive' }}>
                  What was your first online username?
                </div>
                <div className="h-8 bg-[#FFF0F7] rounded border border-[#FFB6D9]/30 mb-3" />
                <div className="font-caveat text-base text-[#3A0030] mb-2" style={{ fontFamily: 'Caveat, cursive' }}>
                  What song defined your childhood?
                </div>
                <div className="h-8 bg-[#FFF0F7] rounded border border-[#FFB6D9]/30" />
              </div>

              {/* Card 2 — front */}
              <div
                className="absolute right-0 bottom-0 w-64 bg-white rounded-xl shadow-xl p-5 border-2 border-[#C9B6FF]"
                style={{ transform: 'rotate(4deg)' }}
              >
                <div className="font-pixel text-[#888] mb-3" style={{ fontSize: '9px' }}>
                  YOUR ANSWERS
                </div>
                <div className="font-caveat text-base text-[#FF4FA3] mb-2" style={{ fontFamily: 'Caveat, cursive' }}>
                  stargirl404...
                </div>
                <div className="font-caveat text-base text-[#FF4FA3] mb-3" style={{ fontFamily: 'Caveat, cursive' }}>
                  Mr. Brightside by The Killers...
                </div>
                <div className="bg-[#E8F8F0] border border-green-200 rounded-lg p-2 font-pixel text-green-600" style={{ fontSize: '9px' }}>
                  MATCHED WITH @sunflower99
                </div>
              </div>

              {/* Floating heart */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl text-[#FF4FA3] animate-sparkle z-10 pointer-events-none select-none">
                ♡
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN — Description */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h2 className="font-pacifico text-4xl text-[#3A0030] mb-4" style={{ fontFamily: 'Pacifico, cursive' }}>
              Scrapbook Exchange
            </h2>
            <p className="font-caveat text-xl text-[#888] mb-4" style={{ fontFamily: 'Caveat, cursive' }}>
              pass notes with a stranger. find your people.
            </p>
            <p className="font-nunito text-[#5A2050] text-base leading-relaxed mb-8">
              Answer the same questions as a stranger or friend. Reveal your answers together and discover similarities, differences, and memories you never knew existed. It's like passing notes — but make it digital.
            </p>

            {/* Steps */}
            <div className="space-y-3">
              {STEPS.map((step, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-7 h-7 rounded-full bg-[#FF4FA3] text-white font-pixel text-sm flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <p className="font-nunito text-sm text-[#5A2050] pt-1">{step}</p>
                </div>
              ))}
            </div>

            <Link href="/explore" className="btn-y2k inline-block mt-8">
              START AN EXCHANGE
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
