'use client'

import { useState, useEffect } from 'react'
import AuthModal from '@/components/ui/AuthModal'
import { createClient } from '@/lib/supabase-client'

interface Props {
  hangoutId: string
  maxParticipants: number
  confirmedCount: number
  status: string
}

export default function RSVPButton({ hangoutId, maxParticipants, confirmedCount, status }: Props) {
  const [userId, setUserId] = useState<string | null>(null)
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null)
  const [count, setCount] = useState(confirmedCount)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const isFull = count >= maxParticipants
  const isCancelled = status === 'cancelled'

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('hangout_rsvps')
        .select('status')
        .eq('hangout_id', hangoutId)
        .eq('user_id', user.id)
        .maybeSingle()

      setRsvpStatus(data?.status ?? null)
      setLoading(false)
    }
    init()
  }, [hangoutId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRSVP() {
    if (!userId) { setShowAuth(true); return }
    if (isCancelled) return
    setWorking(true)
    setError(null)
    setMessage(null)

    try {
      if (rsvpStatus === 'confirmed' || rsvpStatus === 'waitlisted') {
        // Cancel existing RSVP
        await supabase
          .from('hangout_rsvps')
          .delete()
          .eq('hangout_id', hangoutId)
          .eq('user_id', userId)
        if (rsvpStatus === 'confirmed') setCount((c) => Math.max(0, c - 1))
        setRsvpStatus(null)
        setMessage('Your RSVP has been cancelled.')
      } else {
        // Create new RSVP
        const newStatus = isFull ? 'waitlisted' : 'confirmed'
        const { error: insertErr } = await supabase
          .from('hangout_rsvps')
          .upsert({
            hangout_id: hangoutId,
            user_id: userId,
            status: newStatus,
          }, { onConflict: 'hangout_id,user_id' })

        if (insertErr) throw insertErr
        if (newStatus === 'confirmed') setCount((c) => c + 1)
        setRsvpStatus(newStatus)
        setMessage(
          newStatus === 'confirmed'
            ? "You're on the list! See you there. ♡"
            : "This hangout is full, but you can join the waitlist! ♡"
        )
      }
    } catch (e) {
      console.error(e)
      setError('Something went wrong. Please try again.')
    } finally {
      setWorking(false)
    }
  }

  if (loading) {
    return (
      <div className="font-pixel text-[#FFB6D9]" style={{ fontSize: '12px' }}>loading... ✦</div>
    )
  }

  if (isCancelled) {
    return (
      <div style={{
        background: '#FFF0F0', border: '1.5px solid #FF4FA3', borderRadius: 8,
        padding: '12px 16px', fontFamily: 'Verdana, sans-serif', fontSize: 13, color: '#D4006E',
        textAlign: 'center',
      }}>
        This event has been cancelled.
      </div>
    )
  }

  return (
    <div>
      {message && (
        <div style={{
          background: '#F0FFF4', border: '1.5px solid #28C840', borderRadius: 8,
          padding: '10px 14px', marginBottom: 12,
          fontFamily: 'Verdana, sans-serif', fontSize: 13, color: '#1A6E2B',
        }}>
          {message}
        </div>
      )}
      {error && (
        <div style={{
          background: '#FFF0F0', border: '1.5px solid #FF4FA3', borderRadius: 8,
          padding: '10px 14px', marginBottom: 12,
          fontFamily: 'Verdana, sans-serif', fontSize: 13, color: '#D4006E',
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={handleRSVP}
          disabled={working}
          className={rsvpStatus ? 'btn-outline-y2k' : 'btn-y2k'}
          style={{ fontSize: 13, padding: '8px 20px' }}
        >
          {working ? 'saving...' : (
            rsvpStatus === 'confirmed' ? 'cancel RSVP' :
            rsvpStatus === 'waitlisted' ? 'leave waitlist' :
            isFull ? 'join waitlist' :
            'RSVP now ✦'
          )}
        </button>
        <div style={{ fontFamily: "'Silkscreen', monospace", fontSize: 12, color: '#888' }}>
          {count}/{maxParticipants} going
        </div>
      </div>

      {rsvpStatus === 'confirmed' && (
        <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 12, color: '#28C840', marginTop: 8 }}>
          ✓ You&apos;re confirmed for this event!
        </div>
      )}
      {rsvpStatus === 'waitlisted' && (
        <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 12, color: '#FF6B00', marginTop: 8 }}>
          ◎ You&apos;re on the waitlist.
        </div>
      )}

      {showAuth && <AuthModal reason="vote" onClose={() => setShowAuth(false)} />}
    </div>
  )
}
