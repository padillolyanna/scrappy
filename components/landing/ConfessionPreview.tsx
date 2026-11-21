'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import AuthModal from '@/components/ui/AuthModal'
import { useAuth } from '@/lib/useAuth'
import { DEMO_CONFESSIONS, SHOW_DEMO } from '@/lib/demoContent'

export interface ConfessionItem {
  id: string
  content: string
  category: string
  reaction_count: number
}

interface Props {
  confessions?: ConfessionItem[]
}

type CategoryFilter = 'ALL' | 'LOVE' | 'FRIENDSHIP' | 'LIFE' | 'RANDOM' | 'SECRETS'

const CATEGORIES: CategoryFilter[] = ['ALL', 'LOVE', 'FRIENDSHIP', 'LIFE', 'RANDOM', 'SECRETS']

const CAT_COLORS: Record<CategoryFilter, string> = {
  ALL: '#FF4FA3',
  LOVE: '#FF6B9D',
  FRIENDSHIP: '#7C4DDB',
  LIFE: '#FF6B00',
  RANDOM: '#00BADD',
  SECRETS: '#28C840',
}

const NOTE_COLORS: Record<string, string> = {
  LOVE: '#FFF0A8',
  LIFE: '#FFD6EC',
  FRIENDSHIP: '#D6EDFF',
  RANDOM: '#E8D6FF',
  SECRETS: '#FFF0A8',
  Music: '#FFD6EC',
  Regrets: '#D6EDFF',
  Feelings: '#E8D6FF',
}

const ROTATIONS = ['-2deg', '1.5deg', '-1deg', '2deg', '-1.5deg', '1deg', '-2deg', '1.5deg']
const TACK_COLORS = ['#FF4FA3', '#7C4DDB', '#FF6B00', '#00BADD']

function Thumbtack({ color }: { color: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: -8, left: '50%',
        transform: 'translateX(-50%)',
        width: 14, height: 14, borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, #fff 0%, ${color} 60%)`,
        border: '1.5px solid #2B0A2E',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        zIndex: 5,
      }}
    />
  )
}

function normalizeCategory(cat: string): CategoryFilter {
  const up = cat.toUpperCase() as CategoryFilter
  return CATEGORIES.includes(up) ? up : 'RANDOM'
}

export default function ConfessionPreview({ confessions = [] }: Props) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user } = useAuth()

  const isDemo = confessions.length === 0 && SHOW_DEMO

  const sourceItems = isDemo
    ? DEMO_CONFESSIONS.map((c) => ({ id: c.id, content: c.content, category: c.category, reaction_count: c.reaction_count }))
    : confessions

  const filtered = sourceItems.filter((c) => {
    if (activeCategory === 'ALL') return true
    return normalizeCategory(c.category) === activeCategory
  })

  const handleSubmitClick = () => {
    if (user) {
      window.location.href = '/confessions'
    } else {
      setShowAuthModal(true)
    }
  }

  return (
    <section style={{ padding: '0 20px 20px' }}>
      <div className="panel-header">✦ confession wall</div>

      <div
        style={{
          background: '#C8945A',
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
          backgroundSize: '10px 10px',
          border: '2px solid #2B0A2E',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          padding: '12px',
          opacity: isDemo ? 0.85 : 1,
        }}
      >
        {isDemo && (
          <div style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: '#fff8', marginBottom: 8 }}>
            ✦ example — submit the first confession!
          </div>
        )}

        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginBottom: 12 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                fontFamily: "'Chango', 'Arial Black', sans-serif",
                fontSize: 12,
                padding: '4px 10px',
                border: '2px solid #2B0A2E',
                borderBottom: activeCategory === cat ? 'none' : '2px solid #2B0A2E',
                borderRadius: activeCategory === cat ? '4px 4px 0 0' : '4px',
                cursor: 'pointer',
                background: activeCategory === cat ? CAT_COLORS[cat] : 'rgba(255,255,255,0.7)',
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.map((c, i) => {
            const catKey = normalizeCategory(c.category)
            const bg = NOTE_COLORS[c.category] ?? NOTE_COLORS[catKey] ?? '#FFF0A8'
            const rotate = ROTATIONS[i % ROTATIONS.length]
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.04, rotate: 0, zIndex: 10 }}
                className="sticky-note"
                style={{
                  background: bg,
                  padding: '14px 10px 10px',
                  borderRadius: 2,
                  transform: `rotate(${rotate})`,
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
                  {c.content}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontFamily: "'VT323', monospace",
                    fontSize: 12,
                    color: '#888',
                    background: 'rgba(255,255,255,0.5)',
                    padding: '1px 5px',
                    borderRadius: 20,
                  }}>
                    {c.category}
                  </span>
                  {!isDemo && (
                    <span style={{ fontFamily: 'Verdana, sans-serif', fontSize: 12, color: '#888' }}>
                      ♡ {c.reaction_count || 0}
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

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
