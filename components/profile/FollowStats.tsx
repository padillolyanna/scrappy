'use client'

import { useState } from 'react'
import FollowerList from './FollowerList'

interface FollowStatsProps {
  userId: string
  followerCount: number
  followingCount: number
}

export default function FollowStats({ userId, followerCount, followingCount }: FollowStatsProps) {
  const [modal, setModal] = useState<'followers' | 'following' | null>(null)

  return (
    <>
      <div
        style={{
          display: 'flex',
          gap: 12,
          fontFamily: "'Nunito', sans-serif",
          fontSize: 13,
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => setModal('followers')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            fontFamily: 'inherit',
            color: '#2B0A2E',
          }}
        >
          <span style={{ fontWeight: 800, color: '#FF4FA3', fontSize: 15 }}>{followerCount}</span>
          {' '}
          <span style={{ opacity: 0.8 }}>followers</span>
        </button>
        <span style={{ opacity: 0.3 }}>·</span>
        <button
          type="button"
          onClick={() => setModal('following')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            fontFamily: 'inherit',
            color: '#2B0A2E',
          }}
        >
          <span style={{ fontWeight: 800, color: '#FF4FA3', fontSize: 15 }}>{followingCount}</span>
          {' '}
          <span style={{ opacity: 0.8 }}>following</span>
        </button>
      </div>

      {modal && (
        <FollowerList
          userId={userId}
          type={modal}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
