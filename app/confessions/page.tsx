'use client'

import Footer from '@/components/layout/Footer'
import FloatingElements from '@/components/ui/FloatingElements'
import AuthModal from '@/components/ui/AuthModal'
import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/useAuth'
import { createClient } from '@/lib/supabase-client'

interface Confession {
  id: string
  content: string
  category: string
  reaction_count: number
  created_at: string
}

const CATEGORY_COLORS: Record<string, string> = {
  Love: '#FFF0A8',
  Friendship: '#FFD6EC',
  Life: '#D6EDFF',
  Feelings: '#E8D6FF',
  Random: '#FFF0A8',
  Regrets: '#D6EDFF',
  Music: '#FFD6EC',
  Secrets: '#E8D6FF',
}

const ROTATIONS = ['-2deg', '1.5deg', '-1deg', '2deg', '-1.5deg', '1deg', '-0.5deg', '1.8deg']

const CATEGORIES = ['All', 'Love', 'Friendship', 'Life', 'Feelings', 'Random', 'Regrets', 'Music', 'Secrets']

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
        border: '1.5px solid #2B0A2E',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        zIndex: 5,
      }}
    />
  )
}

const TACK_COLORS = ['#FF4FA3', '#7C4DDB', '#FF6B00', '#00BADD']

export default function ConfessionsPage() {
  const [confession, setConfession] = useState('')
  const [category, setCategory] = useState('Random')
  const [filterCategory, setFilterCategory] = useState('All')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [confessions, setConfessions] = useState<Confession[]>([])
  const [loadingConfessions, setLoadingConfessions] = useState(true)
  const { user } = useAuth()

  const fetchConfessions = useCallback(async () => {
    setLoadingConfessions(true)
    const supabase = createClient()
    let query = supabase
      .from('confessions')
      .select('id, content, category, reaction_count, created_at')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(50)

    if (filterCategory !== 'All') {
      query = query.eq('category', filterCategory)
    }

    const { data } = await query
    setConfessions(data ?? [])
    setLoadingConfessions(false)
  }, [filterCategory])

  useEffect(() => {
    fetchConfessions()
  }, [fetchConfessions])

  async function handleSubmit() {
    if (!confession.trim()) return
    if (!user) {
      setShowAuthModal(true)
      return
    }
    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from('confessions').insert({
      content: confession.trim(),
      category,
      is_anonymous: true,
      user_id: user.id,
      is_approved: true,
    })
    setSubmitting(false)
    if (!error) {
      setSubmitted(true)
      setConfession('')
      fetchConfessions()
    }
  }

  async function handleReact(confessionId: string, currentCount: number) {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    const supabase = createClient()
    await supabase
      .from('confessions')
      .update({ reaction_count: currentCount + 1 })
      .eq('id', confessionId)
    setConfessions((prev) =>
      prev.map((c) =>
        c.id === confessionId ? { ...c, reaction_count: c.reaction_count + 1 } : c
      )
    )
  }

  return (
    <div className="flex flex-col min-h-screen relative">
      <FloatingElements count={8} />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div
              className="font-pixel text-xs text-[#C9B6FF] mb-2 tracking-widest"
              style={{ fontSize: '11px' }}
            >
              ✦ ANONYMOUS CONFESSIONS ✦
            </div>
            <h1
              className="font-pacifico text-5xl text-[#3A0030] mb-3"
              style={{ fontFamily: 'Pacifico, cursive', fontSize: 'clamp(32px, 7vw, 52px)' }}
            >
              the confession wall
            </h1>
            <p
              className="font-caveat text-xl text-[#888]"
              style={{ fontFamily: 'Caveat, cursive' }}
            >
              say the thing you&apos;ve never said out loud
            </p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-[#FFD6EC] rounded-2xl p-8 text-center mb-10 border-2 border-[#FFB6D9]"
            >
              <div className="text-4xl font-pixel text-[#FF4FA3] mb-2">✦</div>
              <div
                className="font-pacifico text-2xl text-[#3A0030]"
                style={{ fontFamily: 'Pacifico, cursive' }}
              >
                pinned to the wall!
              </div>
              <div
                className="font-caveat text-lg text-[#888]"
                style={{ fontFamily: 'Caveat, cursive' }}
              >
                your confession is now on the wall ✦
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="btn-y2k mt-4"
              >
                share another
              </button>
            </motion.div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-[#FFB6D9]/50 p-6 mb-10 shadow-lg">
              <div className="font-pixel text-xs text-[#3A0030] mb-3" style={{ fontSize: '10px' }}>
                SHARE YOUR CONFESSION (anonymously)
                {!user && (
                  <span className="text-[#888] ml-2">— members only</span>
                )}
              </div>
              <textarea
                value={confession}
                onChange={(e) => setConfession(e.target.value)}
                placeholder={
                  user
                    ? "write what's on your mind... no judgment here"
                    : 'join scrappy to post anonymously ✦'
                }
                className="input-y2k resize-none font-caveat w-full mb-3"
                rows={3}
                style={{ fontFamily: 'Caveat, cursive', fontSize: '18px' }}
                readOnly={!user}
                onClick={() => !user && setShowAuthModal(true)}
                maxLength={500}
              />
              {user && (
                <div className="font-nunito text-xs text-[#888] mb-3 text-right">
                  {confession.length}/500
                </div>
              )}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-2 flex-wrap">
                  {['Love', 'Friendship', 'Life', 'Random', 'Secrets', 'Regrets', 'Feelings', 'Music'].map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => (user ? setCategory(cat) : setShowAuthModal(true))}
                        className={`font-pixel text-xs px-3 py-1 rounded-full border transition-all ${
                          category === cat && user
                            ? 'bg-[#FF4FA3] border-[#FF4FA3] text-white'
                            : 'border-[#FFB6D9] text-[#3A0030]'
                        }`}
                        style={{ fontSize: '9px' }}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !confession.trim()}
                  className="btn-y2k disabled:opacity-50"
                >
                  {submitting ? '...' : 'pin it'}
                </button>
              </div>
            </div>
          )}

          {/* Category filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`font-pixel text-xs px-3 py-1.5 rounded-full border-2 transition-all ${
                  filterCategory === cat
                    ? 'bg-[#3A0030] border-[#3A0030] text-white'
                    : 'border-[#FFB6D9] text-[#3A0030] bg-white'
                }`}
                style={{ fontSize: '9px' }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Confessions grid */}
          {loadingConfessions ? (
            <div className="text-center py-8">
              <div className="font-caveat text-[#888] text-xl" style={{ fontFamily: 'Caveat, cursive' }}>
                loading confessions...
              </div>
            </div>
          ) : confessions.length === 0 ? (
            <div className="text-center py-8">
              <div className="font-caveat text-[#888] text-xl" style={{ fontFamily: 'Caveat, cursive' }}>
                no confessions yet — be the first ✦
              </div>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {confessions.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.4) }}
                  className="break-inside-avoid relative"
                  style={{
                    transform: `rotate(${ROTATIONS[i % ROTATIONS.length]})`,
                    borderRadius: '2px',
                    boxShadow: '3px 3px 8px rgba(0,0,0,0.12)',
                    background: CATEGORY_COLORS[c.category] ?? '#FFF0A8',
                    padding: '14px 10px 10px',
                    marginBottom: '16px',
                  }}
                >
                  <Thumbtack color={TACK_COLORS[i % TACK_COLORS.length]} />
                  <div
                    className="font-caveat text-[#3A0030] leading-snug mb-3 mt-2"
                    style={{ fontFamily: 'Caveat, cursive', fontSize: '17px', lineHeight: 1.4 }}
                  >
                    &ldquo;{c.content}&rdquo;
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="font-pixel text-[#888]"
                      style={{ fontSize: '9px' }}
                    >
                      {c.category}
                    </span>
                    <button
                      onClick={() => handleReact(c.id, c.reaction_count)}
                      className="flex items-center gap-1 font-nunito text-xs text-[#888] hover:scale-125 transition-transform"
                    >
                      <span>♡</span>
                      <span>{c.reaction_count || 0}</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {showAuthModal && (
        <AuthModal reason="confession" onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  )
}
