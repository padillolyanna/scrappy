'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

interface MiniProfile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

interface FollowerListProps {
  userId: string
  type: 'followers' | 'following'
  onClose: () => void
}

const PAGE_SIZE = 20

export default function FollowerList({ userId, type, onClose }: FollowerListProps) {
  const [profiles, setProfiles] = useState<MiniProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setProfiles([])
    setOffset(0)
    setHasMore(false)
    loadPage(0, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, type])

  async function loadPage(pageOffset: number, replace = false) {
    setLoading(true)
    const supabase = createClient()
    let query

    if (type === 'followers') {
      // get people who follow userId: follower_id -> profiles
      query = supabase
        .from('follows')
        .select('follower:profiles!follows_follower_id_fkey(id, username, display_name, avatar_url)')
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .range(pageOffset, pageOffset + PAGE_SIZE - 1)
    } else {
      // get people userId follows: following_id -> profiles
      query = supabase
        .from('follows')
        .select('following:profiles!follows_following_id_fkey(id, username, display_name, avatar_url)')
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .range(pageOffset, pageOffset + PAGE_SIZE - 1)
    }

    const { data, error } = await query
    if (!error && data) {
      const aliasKey = type === 'followers' ? 'follower' : 'following'
      const extracted = (data as Record<string, unknown>[])
        .map((row) => {
          const prof = row[aliasKey]
          if (!prof) return null
          return (Array.isArray(prof) ? prof[0] : prof) as MiniProfile | null
        })
        .filter((p): p is MiniProfile => !!p)

      if (replace) {
        setProfiles(extracted)
      } else {
        setProfiles((prev) => [...prev, ...extracted])
      }
      setHasMore(extracted.length === PAGE_SIZE)
      setOffset(pageOffset + PAGE_SIZE)
    }
    setLoading(false)
  }

  // close on backdrop click
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose()
  }

  // close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const title = type === 'followers' ? 'followers ✦' : 'following ✦'
  const emptyMsg = type === 'followers' ? 'no followers yet ✦' : 'not following anyone yet ✦'

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(58, 0, 48, 0.65)',
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#FFF0F7',
          border: '3px solid #2B0A2E',
          boxShadow: '6px 6px 0 #2B0A2E',
          borderRadius: 4,
          width: '100%',
          maxWidth: 400,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* title bar */}
        <div
          style={{
            background: 'linear-gradient(180deg, #FF9ECF 0%, #FF4FA3 100%)',
            borderBottom: '2px solid #2B0A2E',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: 22,
              color: '#fff',
              textShadow: '1px 1px 0 #2B0A2E',
            }}
          >
            {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#fff',
              border: '2px solid #2B0A2E',
              borderRadius: 3,
              width: 24,
              height: 24,
              cursor: 'pointer',
              fontFamily: "'VT323', monospace",
              fontSize: 16,
              lineHeight: 1,
              color: '#2B0A2E',
              fontWeight: 700,
            }}
            aria-label="close"
          >
            x
          </button>
        </div>

        {/* list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 12px' }}>
          {loading && profiles.length === 0 && (
            <div
              style={{
                padding: 24,
                textAlign: 'center',
                fontFamily: "'VT323', monospace",
                fontSize: 20,
                color: '#FF4FA3',
              }}
            >
              loading…
            </div>
          )}

          {!loading && profiles.length === 0 && (
            <div
              style={{
                padding: 24,
                textAlign: 'center',
                fontFamily: "'Caveat', cursive",
                fontSize: 18,
                color: '#2B0A2E',
                opacity: 0.7,
              }}
            >
              {emptyMsg}
            </div>
          )}

          {profiles.map((p) => (
            <Link
              key={p.id}
              href={`/profile/${p.username}`}
              onClick={onClose}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 4px',
                  borderBottom: '1px solid rgba(43,10,46,0.12)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    border: '2px solid #2B0A2E',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg,#FF9ECF,#C9A2FF)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {p.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.avatar_url}
                      alt={`@${p.username}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span
                      style={{
                        fontFamily: "'Chango', 'Arial Black', sans-serif",
                        fontSize: 18,
                        color: '#fff',
                      }}
                    >
                      {p.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      color: '#FF4FA3',
                    }}
                  >
                    @{p.username}
                  </div>
                  {p.display_name && (
                    <div
                      style={{
                        fontFamily: "'Caveat', cursive",
                        fontSize: 15,
                        color: '#2B0A2E',
                      }}
                    >
                      {p.display_name}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {hasMore && (
            <button
              type="button"
              onClick={() => loadPage(offset)}
              disabled={loading}
              className="pf-btn"
              style={{ width: '100%', margin: '8px 0', fontSize: 13 }}
            >
              {loading ? 'loading…' : 'load more'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
