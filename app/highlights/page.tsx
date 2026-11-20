'use client'

import { useState, useEffect, useCallback } from 'react'
import Footer from '@/components/layout/Footer'
import AuthModal from '@/components/ui/AuthModal'
import { createClient } from '@/lib/supabase-client'
import { SCRAPBOOK_COVERS } from '@/lib/types'
import Link from 'next/link'

interface VotingCategory {
  id: string
  name: string
  description: string
  voting_type: string
}

interface VotingPeriod {
  id: string
  category_id: string
  end_at: string
  status: string
}

interface ScrapbookEntry {
  id: string
  title: string
  cover_id: string
  like_count: number
  view_count: number
  user_id: string | null
  profiles: { username: string } | null
  vote_count: number
}

const CATEGORIES: VotingCategory[] = [
  { id: 'scrapbook-of-the-day', name: 'Scrapbook of the Day', description: 'The best scrapbook of the day', voting_type: 'daily' },
  { id: 'most-creative', name: 'Most Creative', description: 'The most creative scrapbook', voting_type: 'weekly' },
  { id: 'most-nostalgic', name: 'Most Nostalgic', description: 'The most nostalgic scrapbook', voting_type: 'weekly' },
  { id: 'community-favorite', name: 'Community Favorite', description: "The community's favorite scrapbook", voting_type: 'weekly' },
  { id: 'best-photo-collage', name: 'Best Photo Collage', description: 'The best photo collage', voting_type: 'weekly' },
]

function formatTimeLeft(endAt: string) {
  const diff = new Date(endAt).getTime() - Date.now()
  if (diff <= 0) return 'ended'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h >= 24) {
    const d = Math.floor(h / 24)
    return `${d}d ${h % 24}h left`
  }
  return `${h}h ${m}m left`
}

function ScrapbookVoteCard({
  item,
  isVoted,
  isOwn,
  onVote,
}: {
  item: ScrapbookEntry
  isVoted: boolean
  isOwn: boolean
  onVote: (item: ScrapbookEntry) => void
}) {
  const cover = SCRAPBOOK_COVERS.find((c) => c.id === item.cover_id)
  const username = item.profiles?.username ?? 'anonymous'

  return (
    <div
      style={{
        background: '#fff',
        border: `2px solid ${isVoted ? '#FF4FA3' : '#FFB6D9'}`,
        borderRadius: 8,
        padding: 12,
        boxShadow: isVoted ? '0 0 0 2px #FF4FA3, 2px 2px 0 #2B0A2E' : '2px 2px 0 #2B0A2E',
        position: 'relative',
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
    >
      {isVoted && (
        <div style={{
          position: 'absolute', top: -10, right: 8,
          background: '#FF4FA3', color: 'white',
          fontFamily: "'Silkscreen', monospace", fontSize: 11,
          padding: '2px 8px', borderRadius: 4,
          border: '1.5px solid #2B0A2E',
        }}>
          YOUR VOTE ✦
        </div>
      )}
      <Link href={`/scrapbook/${item.id}`}>
        <div style={{
          width: '100%', height: 110,
          borderRadius: 4, overflow: 'hidden',
          marginBottom: 8, position: 'relative',
        }} className={`bg-gradient-to-br ${cover?.bg_gradient ?? 'from-pink-200 to-pink-100'}`}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="font-pixel text-[#3A0030]/30" style={{ fontSize: 36 }}>{cover?.preview_symbol ?? '✦'}</span>
          </div>
        </div>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: '#3A0030', fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.title || 'untitled'}
        </div>
        <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 11, color: '#FF4FA3', marginBottom: 6 }}>@{username}</div>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: "'Silkscreen', monospace", fontSize: 12, color: '#888' }}>
          ★ {item.vote_count} votes
        </div>
        <button
          onClick={() => onVote(item)}
          disabled={isOwn}
          className={isVoted ? 'btn-y2k' : 'btn-outline-y2k'}
          style={{ fontSize: 11, padding: '3px 10px', opacity: isOwn ? 0.4 : 1, cursor: isOwn ? 'not-allowed' : 'pointer' }}
          title={isOwn ? 'You cannot vote for your own scrapbook' : undefined}
        >
          {isVoted ? '✦ voted!' : 'vote'}
        </button>
      </div>
      {isOwn && (
        <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 11, color: '#aaa', marginTop: 4, textAlign: 'right' }}>
          your scrapbook
        </div>
      )}
    </div>
  )
}

export default function HighlightsPage() {
  const [activeTab, setActiveTab] = useState(CATEGORIES[0].id)
  const [scrapbooks, setScrapbooks] = useState<ScrapbookEntry[]>([])
  const [periods, setPeriods] = useState<Record<string, VotingPeriod>>({})
  const [userVotes, setUserVotes] = useState<Record<string, string>>({}) // categoryId -> scrapbookId
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [confirmVote, setConfirmVote] = useState<{ item: ScrapbookEntry; category: VotingCategory } | null>(null)
  const [votingInProgress, setVotingInProgress] = useState(false)

  const supabase = createClient()

  // Load auth user + voting periods once
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)

      const { data: periodsData } = await supabase
        .from('voting_periods')
        .select('id, category_id, end_at, status')
        .eq('status', 'active')
      const periodsMap: Record<string, VotingPeriod> = {}
      for (const p of periodsData ?? []) {
        periodsMap[p.category_id] = p as VotingPeriod
      }
      setPeriods(periodsMap)

      // Load user's existing votes
      if (user) {
        const periodIds = Object.values(periodsMap).map((p) => p.id)
        if (periodIds.length > 0) {
          const { data: votesData } = await supabase
            .from('highlight_votes')
            .select('category_id, scrapbook_id')
            .eq('user_id', user.id)
            .in('voting_period_id', periodIds)
          const votesMap: Record<string, string> = {}
          for (const v of votesData ?? []) {
            votesMap[v.category_id] = v.scrapbook_id
          }
          setUserVotes(votesMap)
        }
      }
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load scrapbooks + vote counts for active tab
  const loadTab = useCallback(async (categoryId: string) => {
    setLoading(true)
    setError(null)
    try {
      const period = periods[categoryId]
      // Get all public scrapbooks
      const { data: sbData, error: sbErr } = await supabase
        .from('scrapbooks')
        .select('id, title, cover_id, like_count, view_count, user_id, profiles!inner(username)')
        .eq('is_public', true)
        .order('like_count', { ascending: false })
        .limit(12)

      if (sbErr) throw sbErr

      // Get vote counts for this category+period
      let voteCounts: Record<string, number> = {}
      if (period) {
        const { data: voteData } = await supabase
          .from('highlight_votes')
          .select('scrapbook_id')
          .eq('category_id', categoryId)
          .eq('voting_period_id', period.id)
        for (const v of voteData ?? []) {
          voteCounts[v.scrapbook_id] = (voteCounts[v.scrapbook_id] ?? 0) + 1
        }
      }

      type SbRow = { id: string; title: string; cover_id: string; like_count: number; view_count: number; user_id: string | null; profiles: { username: string } | { username: string }[] | null }
      const entries: ScrapbookEntry[] = (sbData ?? []).map((sb) => {
        const row = sb as unknown as SbRow
        return {
          id: row.id,
          title: row.title,
          cover_id: row.cover_id,
          like_count: row.like_count,
          view_count: row.view_count,
          user_id: row.user_id,
          profiles: Array.isArray(row.profiles) ? row.profiles[0] : row.profiles,
          vote_count: voteCounts[row.id] ?? 0,
        }
      })
      // Sort by vote count desc
      entries.sort((a, b) => b.vote_count - a.vote_count)
      setScrapbooks(entries)
    } catch (e) {
      setError('Could not load scrapbooks. Please try again.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [periods]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (Object.keys(periods).length > 0 || loading) {
      loadTab(activeTab)
    }
  }, [activeTab, periods]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleVoteClick(item: ScrapbookEntry) {
    if (!userId) {
      setShowAuth(true)
      return
    }
    const category = CATEGORIES.find((c) => c.id === activeTab)!
    setConfirmVote({ item, category })
  }

  async function castVote() {
    if (!confirmVote || !userId) return
    const { item, category } = confirmVote
    const period = periods[category.id]
    if (!period) {
      setError('No active voting period for this category.')
      setConfirmVote(null)
      return
    }

    setVotingInProgress(true)
    setError(null)
    try {
      // Delete existing vote in same category+period if any
      await supabase
        .from('highlight_votes')
        .delete()
        .eq('user_id', userId)
        .eq('category_id', category.id)
        .eq('voting_period_id', period.id)

      // Insert new vote
      const { error: insertErr } = await supabase
        .from('highlight_votes')
        .insert({
          user_id: userId,
          scrapbook_id: item.id,
          category_id: category.id,
          voting_period_id: period.id,
        })

      if (insertErr) throw insertErr

      setUserVotes((prev) => ({ ...prev, [category.id]: item.id }))
      setConfirmVote(null)
      // Reload to get fresh vote counts
      await loadTab(activeTab)
    } catch (e) {
      console.error(e)
      setError('Something went wrong while casting your vote. Please try again.')
    } finally {
      setVotingInProgress(false)
    }
  }

  const activePeriod = periods[activeTab]
  const activeCategory = CATEGORIES.find((c) => c.id === activeTab)!

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-10 max-w-6xl mx-auto w-full px-4">
        {/* Header */}
        <div className="text-center mb-6 px-4">
          <div className="font-pixel text-xs text-[#FF4FA3] mb-2 tracking-widest" style={{ fontSize: '12px' }}>
            ✦ SCRAPPY HIGHLIGHTS ✦
          </div>
          <h1 className="font-pacifico text-5xl text-[#3A0030]" style={{ fontFamily: 'Pacifico, cursive', fontSize: 'clamp(28px, 6vw, 48px)' }}>
            community showcase
          </h1>
          <p className="font-caveat text-xl text-[#888] mt-2" style={{ fontFamily: 'Caveat, cursive' }}>
            vote for your favorite scrapbooks! ✦
          </p>
        </div>

        {/* Window chrome */}
        <div className="window-chrome overflow-hidden rounded-lg shadow-xl">
          <div className="window-title-bar">
            <span>highlights.exe — cast your vote</span>
            <div className="flex gap-1">
              <span className="window-btn">_</span>
              <span className="window-btn">□</span>
              <span className="window-btn">x</span>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b-2 border-[#FFB6D9]/40 pb-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={activeTab === cat.id ? 'btn-y2k' : 'btn-outline-y2k'}
                  style={{ fontSize: 11, padding: '4px 12px' }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Period info */}
            {activePeriod && (
              <div style={{
                background: '#FFF0F7', border: '1.5px solid #FFB6D9', borderRadius: 6,
                padding: '8px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontFamily: "'Silkscreen', monospace", fontSize: 12, color: '#FF4FA3' }}>
                  ⏱ {formatTimeLeft(activePeriod.end_at)}
                </span>
                <span style={{ fontFamily: 'Verdana, sans-serif', fontSize: 12, color: '#888' }}>
                  — {activeCategory.voting_type === 'daily' ? 'daily vote' : 'weekly vote'} · {activeCategory.description}
                </span>
              </div>
            )}

            {!activePeriod && (
              <div style={{
                background: '#f9f9f9', border: '1.5px solid #ddd', borderRadius: 6,
                padding: '8px 14px', marginBottom: 20, fontFamily: 'Verdana, sans-serif', fontSize: 12, color: '#aaa',
              }}>
                No active voting period for this category right now.
              </div>
            )}

            {error && (
              <div style={{
                background: '#FFF0F0', border: '1.5px solid #FF4FA3', borderRadius: 6,
                padding: '8px 14px', marginBottom: 16, fontFamily: 'Verdana, sans-serif', fontSize: 12, color: '#D4006E',
              }}>
                {error}
              </div>
            )}

            {/* Scrapbooks grid */}
            {loading ? (
              <div className="text-center py-12 font-pixel text-[#FFB6D9]" style={{ fontSize: '13px' }}>
                loading... ✦
              </div>
            ) : scrapbooks.length === 0 ? (
              <div className="text-center py-12">
                <div className="font-caveat text-2xl text-[#888]" style={{ fontFamily: 'Caveat, cursive' }}>
                  No public scrapbooks yet. Be the first to create one! ♡
                </div>
                <Link href="/scrapbook/create" className="btn-y2k mt-4 inline-block" style={{ fontSize: 12 }}>
                  Create a Scrapbook ✦
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {scrapbooks.map((item) => (
                  <ScrapbookVoteCard
                    key={item.id}
                    item={item}
                    isVoted={userVotes[activeTab] === item.id}
                    isOwn={userId !== null && item.user_id !== null && userId === item.user_id}
                    onVote={handleVoteClick}
                  />
                ))}
              </div>
            )}

            {!userId && (
              <div style={{
                marginTop: 20, padding: '12px 16px',
                background: '#FFF0F7', border: '1.5px solid #FFB6D9', borderRadius: 8,
                fontFamily: 'Verdana, sans-serif', fontSize: 12, color: '#3A0030', textAlign: 'center',
              }}>
                <span>Log in or join Scrappy to cast your vote! </span>
                <button onClick={() => setShowAuth(true)} className="btn-y2k ml-2" style={{ fontSize: 11, padding: '3px 10px' }}>
                  Join ✦
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Auth modal */}
      {showAuth && <AuthModal reason="vote" onClose={() => setShowAuth(false)} />}

      {/* Vote confirmation modal */}
      {confirmVote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#3A0030]/60 backdrop-blur-sm" onClick={() => setConfirmVote(null)} />
          <div className="relative z-10 w-full max-w-sm animate-bounce-in">
            <div className="window-chrome overflow-hidden rounded-lg shadow-2xl">
              <div className="window-title-bar">
                <span>confirm_vote.exe</span>
                <div className="flex gap-1">
                  <span className="window-btn">_</span>
                  <span className="window-btn">□</span>
                  <button className="window-btn" onClick={() => setConfirmVote(null)}>x</button>
                </div>
              </div>
              <div className="bg-white p-6 text-center">
                <div className="font-pixel text-3xl text-[#FF4FA3] mb-3">★</div>
                <h3 className="font-pacifico text-xl text-[#3A0030] mb-3" style={{ fontFamily: 'Pacifico, cursive' }}>
                  ready to cast your vote?
                </h3>
                <p className="font-caveat text-lg text-[#888] mb-2" style={{ fontFamily: 'Caveat, cursive' }}>
                  You&apos;re voting for
                </p>
                <div style={{ background: '#FFF0F7', border: '1.5px solid #FFB6D9', borderRadius: 6, padding: '8px 12px', marginBottom: 12 }}>
                  <div className="font-caveat text-lg text-[#3A0030] font-bold" style={{ fontFamily: 'Caveat, cursive' }}>
                    {confirmVote.item.title || 'untitled'}
                  </div>
                  <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 12, color: '#FF4FA3' }}>
                    @{confirmVote.item.profiles?.username ?? 'anonymous'}
                  </div>
                </div>
                <p className="font-caveat text-base text-[#888] mb-4" style={{ fontFamily: 'Caveat, cursive' }}>
                  in <strong>{confirmVote.category.name}</strong>
                  {userVotes[activeTab] ? ' — this will replace your existing vote.' : '.'}
                </p>
                <div className="space-y-2">
                  <button
                    onClick={castVote}
                    disabled={votingInProgress}
                    className="btn-y2k w-full py-2.5"
                  >
                    {votingInProgress ? 'casting...' : 'yes, cast my vote! ✦'}
                  </button>
                  <button
                    onClick={() => setConfirmVote(null)}
                    className="btn-outline-y2k w-full py-2.5"
                  >
                    not now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
