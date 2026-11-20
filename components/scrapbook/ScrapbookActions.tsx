'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import AuthModal from '@/components/ui/AuthModal'

interface Props {
  scrapbookId: string
  userId: string | null
  isOwner: boolean
  initialLikeCount: number
  initialVoted: boolean
  initialFavorited: boolean
  shareUrl: string
}

export default function ScrapbookActions({
  scrapbookId,
  userId,
  isOwner,
  initialLikeCount,
  initialVoted,
  initialFavorited,
  shareUrl,
}: Props) {
  const [voted, setVoted] = useState(initialVoted)
  const [favorited, setFavorited] = useState(initialFavorited)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [copyDone, setCopyDone] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authReason, setAuthReason] = useState<'vote' | 'favorite'>('vote')
  const [loading, setLoading] = useState(false)

  async function handleVote() {
    if (!userId) {
      setAuthReason('vote')
      setShowAuthModal(true)
      return
    }
    if (loading) return
    setLoading(true)
    const supabase = createClient()
    if (voted) {
      await supabase
        .from('scrapbook_votes')
        .delete()
        .eq('scrapbook_id', scrapbookId)
        .eq('user_id', userId)
      await supabase
        .from('scrapbooks')
        .update({ like_count: Math.max(0, likeCount - 1) })
        .eq('id', scrapbookId)
      setVoted(false)
      setLikeCount((n) => Math.max(0, n - 1))
    } else {
      const { error } = await supabase
        .from('scrapbook_votes')
        .insert({ scrapbook_id: scrapbookId, user_id: userId, vote_type: 'like' })
      if (!error) {
        await supabase
          .from('scrapbooks')
          .update({ like_count: likeCount + 1 })
          .eq('id', scrapbookId)
        setVoted(true)
        setLikeCount((n) => n + 1)
      }
    }
    setLoading(false)
  }

  async function handleFavorite() {
    if (!userId) {
      setAuthReason('favorite')
      setShowAuthModal(true)
      return
    }
    if (loading) return
    setLoading(true)
    const supabase = createClient()
    if (favorited) {
      await supabase
        .from('favorites')
        .delete()
        .eq('scrapbook_id', scrapbookId)
        .eq('user_id', userId)
      setFavorited(false)
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ scrapbook_id: scrapbookId, user_id: userId })
      if (!error) setFavorited(true)
    }
    setLoading(false)
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopyDone(true)
      setTimeout(() => setCopyDone(false), 2000)
    })
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: 'Check out this scrapbook on SCRAPPY!', url: shareUrl })
    } else {
      handleCopyLink()
    }
  }

  return (
    <>
      <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
        <button
          onClick={handleVote}
          disabled={loading}
          className={`font-pixel text-xs py-2 px-5 rounded-full border-2 transition-all ${
            voted
              ? 'bg-[#FF4FA3] border-[#FF4FA3] text-white shadow-md'
              : 'border-[#FFB6D9] text-[#3A0030] hover:border-[#FF4FA3] bg-white'
          }`}
          style={{ fontSize: '11px' }}
        >
          {voted ? '♡ liked!' : '♡ like'} {likeCount > 0 && `(${likeCount})`}
        </button>

        <button
          onClick={handleFavorite}
          disabled={loading}
          className={`font-pixel text-xs py-2 px-5 rounded-full border-2 transition-all ${
            favorited
              ? 'bg-[#C9B6FF] border-[#C9B6FF] text-white shadow-md'
              : 'border-[#FFB6D9] text-[#3A0030] hover:border-[#C9B6FF] bg-white'
          }`}
          style={{ fontSize: '11px' }}
        >
          {favorited ? '★ saved!' : '★ save'}
        </button>

        <button
          onClick={handleCopyLink}
          className="font-pixel text-xs py-2 px-5 rounded-full border-2 border-[#FFB6D9] text-[#3A0030] hover:border-[#FF4FA3] bg-white transition-all"
          style={{ fontSize: '11px' }}
        >
          {copyDone ? '✓ copied!' : '◎ copy link'}
        </button>

        <button
          onClick={handleShare}
          className="font-pixel text-xs py-2 px-5 rounded-full border-2 border-[#FFB6D9] text-[#3A0030] hover:border-[#FF4FA3] bg-white transition-all"
          style={{ fontSize: '11px' }}
        >
          share ✦
        </button>
      </div>

      {showAuthModal && (
        <AuthModal reason={authReason} onClose={() => setShowAuthModal(false)} />
      )}
    </>
  )
}
