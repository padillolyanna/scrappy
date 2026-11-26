'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

interface FollowButtonProps {
  targetUserId: string
  targetUsername: string
  initialState: {
    isFollowing: boolean
    isRequested: boolean
    isPrivate: boolean
  }
  viewerId?: string | null
}

type FollowState = 'following' | 'requested' | 'none'
type UIPhase = 'idle' | 'loading' | 'confirm-unfollow'

export default function FollowButton({
  targetUserId,
  targetUsername,
  initialState,
  viewerId,
}: FollowButtonProps) {
  const [followState, setFollowState] = useState<FollowState>(
    initialState.isFollowing ? 'following' : initialState.isRequested ? 'requested' : 'none'
  )
  const [phase, setPhase] = useState<UIPhase>('idle')

  if (!viewerId) {
    return (
      <Link href="/auth/login" className="pf-btn">
        + follow
      </Link>
    )
  }

  async function handleFollow() {
    setPhase('loading')
    const prev = followState
    // optimistic
    setFollowState(initialState.isPrivate ? 'requested' : 'following')
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('send_follow_or_request', {
        p_target_id: targetUserId,
      })
      if (error) throw error
      setFollowState(data === 'followed' ? 'following' : 'requested')
    } catch {
      setFollowState(prev)
    } finally {
      setPhase('idle')
    }
  }

  async function handleUnfollow() {
    setPhase('loading')
    const prev = followState
    setFollowState('none')
    try {
      const supabase = createClient()
      const { error } = await supabase.rpc('unfollow_user', {
        p_target_id: targetUserId,
      })
      if (error) throw error
    } catch {
      setFollowState(prev)
    } finally {
      setPhase('idle')
    }
  }

  async function handleCancelRequest() {
    setPhase('loading')
    const prev = followState
    setFollowState('none')
    try {
      const supabase = createClient()
      const { error } = await supabase.rpc('cancel_follow_request', {
        p_recipient_id: targetUserId,
      })
      if (error) throw error
    } catch {
      setFollowState(prev)
    } finally {
      setPhase('idle')
    }
  }

  const isLoading = phase === 'loading'

  if (phase === 'confirm-unfollow') {
    return (
      <div className="flex items-center gap-1" style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13 }}>
        <span style={{ color: '#2B0A2E', fontWeight: 600 }}>unfollow @{targetUsername}?</span>
        <button
          type="button"
          onClick={() => { setPhase('idle'); handleUnfollow() }}
          className="pf-btn"
          style={{ padding: '2px 10px', fontSize: 12, background: 'linear-gradient(180deg,#ff9ecf,#FF4FA3)', color: '#fff' }}
        >
          yes
        </button>
        <button
          type="button"
          onClick={() => setPhase('idle')}
          className="pf-btn"
          style={{ padding: '2px 10px', fontSize: 12 }}
        >
          no
        </button>
      </div>
    )
  }

  if (followState === 'following') {
    return (
      <button
        type="button"
        disabled={isLoading}
        onClick={() => setPhase('confirm-unfollow')}
        className="pf-btn"
        style={{
          background: 'linear-gradient(180deg, #2B0A2E 0%, #3A0030 100%)',
          color: '#fff',
          border: '2px solid #2B0A2E',
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        {isLoading ? '…' : '✓ following'}
      </button>
    )
  }

  if (followState === 'requested') {
    return (
      <button
        type="button"
        disabled={isLoading}
        onClick={handleCancelRequest}
        className="pf-btn"
        style={{
          background: '#fff',
          color: '#C9A2FF',
          border: '2px solid #C9A2FF',
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        {isLoading ? '…' : '⏳ requested'}
      </button>
    )
  }

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={handleFollow}
      className="pf-btn btn-y2k"
      style={{ opacity: isLoading ? 0.7 : 1 }}
    >
      {isLoading ? '…' : '+ follow'}
    </button>
  )
}
