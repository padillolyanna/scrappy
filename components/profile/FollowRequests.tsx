'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { useAuth } from '@/lib/useAuth'

interface Requester {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  request_id: string
}

interface FollowRequestsProps {
  ownerId: string
}

export default function FollowRequests({ ownerId }: FollowRequestsProps) {
  const { user } = useAuth()
  const [requests, setRequests] = useState<Requester[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<Record<string, boolean>>({})

  const isOwner = user?.id === ownerId

  useEffect(() => {
    if (!isOwner) {
      setLoading(false)
      return
    }
    fetchRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwner, ownerId])

  async function fetchRequests() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('follow_requests')
      .select('id, requester_id, requester:profiles!follow_requests_requester_id_fkey(id, username, display_name, avatar_url)')
      .eq('recipient_id', ownerId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      type ProfileRow = { id: string; username: string; display_name: string | null; avatar_url: string | null }
      type RequestRow = {
        id: string
        requester_id: string
        requester: ProfileRow | ProfileRow[] | null
      }
      const parsed = (data as RequestRow[]).map((row) => {
        const prof = Array.isArray(row.requester) ? row.requester[0] ?? null : row.requester
        return {
          id: prof?.id ?? row.requester_id,
          username: prof?.username ?? '',
          display_name: prof?.display_name ?? null,
          avatar_url: prof?.avatar_url ?? null,
          request_id: row.id,
        }
      }).filter((r) => r.username)

      setRequests(parsed)
    }
    setLoading(false)
  }

  async function handleAccept(requesterId: string) {
    setBusy((b) => ({ ...b, [requesterId]: true }))
    const supabase = createClient()
    const { error } = await supabase.rpc('accept_follow_request', {
      p_requester_id: requesterId,
    })
    if (!error) {
      setRequests((prev) => prev.filter((r) => r.id !== requesterId))
    }
    setBusy((b) => ({ ...b, [requesterId]: false }))
  }

  async function handleDecline(requesterId: string) {
    setBusy((b) => ({ ...b, [requesterId]: true }))
    const supabase = createClient()
    const { error } = await supabase.rpc('decline_follow_request', {
      p_requester_id: requesterId,
    })
    if (!error) {
      setRequests((prev) => prev.filter((r) => r.id !== requesterId))
    }
    setBusy((b) => ({ ...b, [requesterId]: false }))
  }

  if (!isOwner || loading || requests.length === 0) return null

  return (
    <div
      style={{
        background: '#FFF0F7',
        border: '2px solid #2B0A2E',
        boxShadow: '4px 4px 0 #2B0A2E',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 12,
      }}
    >
      {/* header */}
      <div
        style={{
          background: 'linear-gradient(180deg, #C9A2FF 0%, #9B6EDB 100%)',
          borderBottom: '2px solid #2B0A2E',
          padding: '5px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: 20,
            color: '#fff',
            textShadow: '1px 1px 0 #2B0A2E',
          }}
        >
          pending follow requests
        </span>
        <span
          style={{
            background: '#FF4FA3',
            color: '#fff',
            border: '2px solid #2B0A2E',
            borderRadius: 999,
            fontFamily: "'VT323', monospace",
            fontSize: 16,
            padding: '0 7px',
            lineHeight: '20px',
            display: 'inline-block',
          }}
        >
          {requests.length}
        </span>
      </div>

      {/* list */}
      <div style={{ padding: '6px 12px' }}>
        {requests.map((r) => (
          <div
            key={r.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '7px 0',
              borderBottom: '1px solid rgba(43,10,46,0.1)',
            }}
          >
            {/* avatar */}
            <div
              style={{
                width: 36,
                height: 36,
                flexShrink: 0,
                border: '2px solid #2B0A2E',
                overflow: 'hidden',
                background: 'linear-gradient(135deg,#FF9ECF,#C9A2FF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {r.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.avatar_url}
                  alt={`@${r.username}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span
                  style={{
                    fontFamily: "'Chango', 'Arial Black', sans-serif",
                    fontSize: 16,
                    color: '#fff',
                  }}
                >
                  {r.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* name */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <Link
                href={`/profile/${r.username}`}
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: '#FF4FA3',
                  textDecoration: 'none',
                }}
              >
                @{r.username}
              </Link>
              {r.display_name && (
                <div
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: 14,
                    color: '#2B0A2E',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {r.display_name}
                </div>
              )}
            </div>

            {/* actions */}
            <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
              <button
                type="button"
                disabled={busy[r.id]}
                onClick={() => handleAccept(r.id)}
                className="btn-pill-pink"
                style={{
                  fontSize: 12,
                  padding: '3px 10px',
                  opacity: busy[r.id] ? 0.6 : 1,
                }}
              >
                {busy[r.id] ? '…' : 'accept'}
              </button>
              <button
                type="button"
                disabled={busy[r.id]}
                onClick={() => handleDecline(r.id)}
                className="btn-pill"
                style={{
                  fontSize: 12,
                  padding: '3px 10px',
                  opacity: busy[r.id] ? 0.6 : 1,
                  background: '#fff',
                  color: '#2B0A2E',
                  border: '2px solid #2B0A2E',
                }}
              >
                {busy[r.id] ? '…' : 'decline'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
