'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import AuthModal from '@/components/ui/AuthModal'
import { useAuth } from '@/lib/useAuth'

type Category = 'ALL' | 'LOVE' | 'FRIENDSHIP' | 'LIFE' | 'RANDOM' | 'SECRETS'

const CATEGORIES: Category[] = ['ALL', 'LOVE', 'FRIENDSHIP', 'LIFE', 'RANDOM', 'SECRETS']

const CONFESSIONS = [
  { category: 'LOVE', text: 'I still look for him in every crowded place even though I know we\'re never going to meet again.', reactions: 234, color: 'bg-[#FFF0A8]', rotate: '-2deg' },
  { category: 'LIFE', text: 'Sometimes I wonder if I\'m doing enough or if I\'m just pretending that everything is okay.', reactions: 189, color: 'bg-[#FFD6EC]', rotate: '1.5deg' },
  { category: 'FRIENDSHIP', text: 'I miss the people I used to talk to every single day. I wonder if they ever think about me too.', reactions: 312, color: 'bg-[#D6EDFF]', rotate: '-1deg' },
  { category: 'RANDOM', text: 'Sometimes the smallest things remind me of memories I didn\'t even know I still had.', reactions: 156, color: 'bg-[#E8D6FF]', rotate: '2deg' },
  { category: 'SECRETS', text: 'I wish I could tell someone everything without worrying about being misunderstood.', reactions: 278, color: 'bg-[#FFF0A8]', rotate: '-1.5deg' },
  { category: 'LOVE', text: 'I don\'t think I ever really stopped caring. I just learned how to stay quiet about it.', reactions: 445, color: 'bg-[#FFD6EC]', rotate: '1deg' },
  { category: 'FRIENDSHIP', text: 'I hope my old friends are doing well, even if we don\'t talk anymore.', reactions: 388, color: 'bg-[#D6EDFF]', rotate: '-2deg' },
  { category: 'LIFE', text: 'I just want to experience a version of life where I don\'t have to worry about everything.', reactions: 521, color: 'bg-[#E8D6FF]', rotate: '1.5deg' },
]

export default function ConfessionPreview() {
  const [activeCategory, setActiveCategory] = useState<Category>('ALL')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user } = useAuth()

  const filtered = activeCategory === 'ALL'
    ? CONFESSIONS
    : CONFESSIONS.filter((c) => c.category === activeCategory)

  const handleSubmitClick = () => {
    if (user) {
      window.location.href = '/confessions'
    } else {
      setShowAuthModal(true)
    }
  }

  return (
    <section className="py-16 lg:py-20 bg-[#FFF8ED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="font-pixel text-[#C9B6FF] tracking-widest mb-1" style={{ fontSize: '11px' }}>
              ANONYMOUS THOUGHTS
            </div>
            <h2 className="font-pacifico text-4xl text-[#3A0030]" style={{ fontFamily: 'Pacifico, cursive' }}>
              The Confession Wall
            </h2>
          </div>
          <Link href="/confessions" className="font-pixel text-[#FF4FA3] hover:underline" style={{ fontSize: '11px' }}>
            READ ALL →
          </Link>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="font-pixel px-3 py-1.5 rounded-full border-2 transition-colors"
              style={{
                fontSize: '10px',
                ...(activeCategory === cat
                  ? { background: '#3A0030', borderColor: '#3A0030', color: 'white' }
                  : { background: 'white', borderColor: '#FFB6D9', color: '#3A0030' }),
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Confession notes grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.03, rotate: 0, zIndex: 10 }}
              className={`${c.color} p-5 relative cursor-pointer`}
              style={{
                transform: `rotate(${c.rotate})`,
                borderRadius: '2px',
                boxShadow: '3px 3px 8px rgba(0,0,0,0.12)',
              }}
            >
              {/* Pushpin */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#FF4FA3] shadow-md" />

              {/* Category badge */}
              <div className="absolute top-3 right-3 bg-white/50 font-pixel px-2 py-0.5 rounded-full" style={{ fontSize: '8px', color: '#888' }}>
                {c.category}
              </div>

              {/* Text */}
              <p
                className="font-caveat text-lg text-[#3A0030] leading-snug mt-4 mb-3"
                style={{ fontFamily: 'Caveat, cursive', fontSize: '17px' }}
              >
                {c.text}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[#888]" style={{ fontSize: '8px' }}>
                  {c.category}
                </span>
                <span className="font-nunito text-xs text-[#888]">♡ {c.reactions}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-10">
          {user ? (
            <Link href="/confessions" className="btn-y2k">
              + SUBMIT AN ANONYMOUS CONFESSION
            </Link>
          ) : (
            <button onClick={handleSubmitClick} className="btn-y2k">
              + SUBMIT AN ANONYMOUS CONFESSION
            </button>
          )}
        </div>
      </div>

      {showAuthModal && (
        <AuthModal reason="confession" onClose={() => setShowAuthModal(false)} />
      )}
    </section>
  )
}
