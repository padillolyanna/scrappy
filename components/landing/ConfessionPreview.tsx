'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import AuthModal from '@/components/ui/AuthModal'
import { useAuth } from '@/lib/useAuth'

type Category = 'ALL' | 'LOVE' | 'FRIENDSHIP' | 'LIFE' | 'RANDOM' | 'SECRETS'

const CATEGORIES: Category[] = ['ALL', 'LOVE', 'FRIENDSHIP', 'LIFE', 'RANDOM', 'SECRETS']

const CAT_COLORS: Record<Category, string> = {
  ALL: '#FF4FA3',
  LOVE: '#FF6B9D',
  FRIENDSHIP: '#7C4DDB',
  LIFE: '#FF6B00',
  RANDOM: '#00BADD',
  SECRETS: '#28C840',
}

const CONFESSIONS = [
  { category: 'LOVE' as Category, text: 'I still look for him in every crowded place even though I know we\'re never going to meet again.', reactions: 234, color: '#FFF0A8', rotate: '-2deg' },
  { category: 'LIFE' as Category, text: 'Sometimes I wonder if I\'m doing enough or if I\'m just pretending that everything is okay.', reactions: 189, color: '#FFD6EC', rotate: '1.5deg' },
  { category: 'FRIENDSHIP' as Category, text: 'I miss the people I used to talk to every single day. I wonder if they ever think about me too.', reactions: 312, color: '#D6EDFF', rotate: '-1deg' },
  { category: 'RANDOM' as Category, text: 'Sometimes the smallest things remind me of memories I didn\'t even know I still had.', reactions: 156, color: '#E8D6FF', rotate: '2deg' },
  { category: 'SECRETS' as Category, text: 'I wish I could tell someone everything without worrying about being misunderstood.', reactions: 278, color: '#FFF0A8', rotate: '-1.5deg' },
  { category: 'LOVE' as Category, text: 'I don\'t think I ever really stopped caring. I just learned how to stay quiet about it.', reactions: 445, color: '#FFD6EC', rotate: '1deg' },
  { category: 'FRIENDSHIP' as Category, text: 'I hope my old friends are doing well, even if we don\'t talk anymore.', reactions: 388, color: '#D6EDFF', rotate: '-2deg' },
  { category: 'LIFE' as Category, text: 'I just want to experience a version of life where I don\'t have to worry about everything.', reactions: 521, color: '#E8D6FF', rotate: '1.5deg' },
]

// CSS thumbtack
function Thumbtack({ color }: { color: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: -8,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 14,
        height: 14,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, #fff 0%, ${color} 60%)`,
        border: `1.5px solid #2B0A2E`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        zIndex: 5,
      }}
    />
  )
}

const TACK_COLORS = ['#FF4FA3', '#7C4DDB', '#FF6B00', '#00BADD']

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
    <section style={{ padding: '0 20px 20px' }}>
      <div className="panel-header">
        ✦ confession wall
      </div>

      {/* Corkboard area */}
      <div
        style={{
          background: '#C8945A',
          backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: '10px 10px',
          border: '2px solid #2B0A2E',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          padding: '12px',
        }}
      >
        {/* Category folder tabs */}
        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginBottom: 12 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                fontFamily: "'Chango', 'Arial Black', sans-serif",
                fontSize: 10,
                padding: '4px 10px',
                border: '2px solid #2B0A2E',
                borderBottom: activeCategory === cat ? 'none' : '2px solid #2B0A2E',
                borderRadius: activeCategory === cat ? '4px 4px 0 0' : '4px',
                cursor: 'pointer',
                background: activeCategory === cat
                  ? CAT_COLORS[cat]
                  : 'rgba(255,255,255,0.7)',
                color: activeCategory === cat ? 'white' : '#3A0030',
                transform: activeCategory === cat ? 'translateY(2px)' : 'none',
                position: 'relative',
                zIndex: activeCategory === cat ? 5 : 1,
                transition: 'all 0.1s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Confession notes grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.map((c, i) => (
            <motion.div
              key={`${activeCategory}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.04, rotate: 0, zIndex: 10 }}
              className="sticky-note"
              style={{
                background: c.color,
                padding: '14px 10px 10px',
                borderRadius: 2,
                transform: `rotate(${c.rotate})`,
                boxShadow: '3px 3px 8px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <Thumbtack color={TACK_COLORS[i % TACK_COLORS.length]} />

              <p style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 14,
                color: '#3A0030',
                lineHeight: 1.4,
                marginTop: 6,
                marginBottom: 8,
              }}>
                {c.text}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontFamily: "'VT323', monospace",
                  fontSize: 11,
                  color: '#888',
                  background: 'rgba(255,255,255,0.5)',
                  padding: '1px 5px',
                  borderRadius: 20,
                }}>
                  {c.category}
                </span>
                <span style={{ fontFamily: 'Verdana, sans-serif', fontSize: 10, color: '#888' }}>
                  ♡ {c.reactions}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          {user ? (
            <Link href="/confessions" className="btn-bevel" style={{ fontSize: 12 }}>
              + SUBMIT AN ANONYMOUS CONFESSION
            </Link>
          ) : (
            <button onClick={handleSubmitClick} className="btn-bevel" style={{ fontSize: 12 }}>
              + SUBMIT AN ANONYMOUS CONFESSION
            </button>
          )}
          <Link
            href="/confessions"
            style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: '#2B0A2E', textDecoration: 'underline', background: 'rgba(255,255,255,0.6)', padding: '2px 8px', borderRadius: 20 }}
          >
            READ ALL →
          </Link>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal reason="confession" onClose={() => setShowAuthModal(false)} />
      )}
    </section>
  )
}
