'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'scrapbook-night', label: 'Scrapbook Night' },
  { value: 'journal-with-me', label: 'Journal With Me' },
  { value: 'photobooth-party', label: 'Photobooth Party' },
  { value: 'exchange-meetup', label: 'Exchange Meetup' },
  { value: 'theme-week', label: 'Theme Week' },
  { value: 'memory-sharing', label: 'Memory Sharing' },
  { value: 'workshop', label: 'Workshop' },
]

const EVENT_TYPES = [
  { value: 'online', label: 'Online' },
  { value: 'in-person', label: 'In-Person' },
  { value: 'hybrid', label: 'Hybrid' },
]

export default function AdminHangoutForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [eventType, setEventType] = useState('online')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [location, setLocation] = useState('')
  const [maxParticipants, setMaxParticipants] = useState(20)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: insertErr } = await supabase.from('hangouts').insert({
        title,
        description: description || null,
        category,
        host_id: user.id,
        start_at: new Date(startAt).toISOString(),
        end_at: endAt ? new Date(endAt).toISOString() : null,
        timezone: 'Asia/Manila',
        event_type: eventType,
        meeting_url: meetingUrl || null,
        location: location || null,
        max_participants: maxParticipants,
        status: 'upcoming',
        visibility: 'public',
      })

      if (insertErr) throw insertErr

      setSuccess(true)
      setTimeout(() => router.push('/hangouts'), 1500)
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{
        background: '#F0FFF4', border: '2px solid #28C840', borderRadius: 8,
        padding: '20px 24px', textAlign: 'center',
        fontFamily: 'Verdana, sans-serif', fontSize: 14, color: '#1A6E2B',
      }}>
        Hangout created! Redirecting... ♡
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div style={{
          background: '#FFF0F0', border: '1.5px solid #FF4FA3', borderRadius: 8,
          padding: '12px 16px', fontFamily: 'Verdana, sans-serif', fontSize: 13, color: '#D4006E',
        }}>
          {error}
        </div>
      )}

      <div>
        <label className="font-pixel text-xs text-[#3A0030] block mb-1" style={{ fontSize: '12px' }}>TITLE *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="input-y2k w-full"
          placeholder="e.g. Scrapbook Night with the girls"
        />
      </div>

      <div>
        <label className="font-pixel text-xs text-[#3A0030] block mb-1" style={{ fontSize: '12px' }}>DESCRIPTION</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-y2k w-full"
          rows={4}
          placeholder="Tell people what to expect..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-pixel text-xs text-[#3A0030] block mb-1" style={{ fontSize: '12px' }}>CATEGORY</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-y2k w-full">
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-pixel text-xs text-[#3A0030] block mb-1" style={{ fontSize: '12px' }}>EVENT TYPE</label>
          <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="input-y2k w-full">
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-pixel text-xs text-[#3A0030] block mb-1" style={{ fontSize: '12px' }}>START DATE & TIME *</label>
          <input
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            required
            className="input-y2k w-full"
          />
        </div>
        <div>
          <label className="font-pixel text-xs text-[#3A0030] block mb-1" style={{ fontSize: '12px' }}>END DATE & TIME</label>
          <input
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            className="input-y2k w-full"
          />
        </div>
      </div>

      {(eventType === 'online' || eventType === 'hybrid') && (
        <div>
          <label className="font-pixel text-xs text-[#3A0030] block mb-1" style={{ fontSize: '12px' }}>MEETING URL</label>
          <input
            type="url"
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            className="input-y2k w-full"
            placeholder="https://meet.google.com/..."
          />
        </div>
      )}

      {(eventType === 'in-person' || eventType === 'hybrid') && (
        <div>
          <label className="font-pixel text-xs text-[#3A0030] block mb-1" style={{ fontSize: '12px' }}>LOCATION</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input-y2k w-full"
            placeholder="e.g. Poblacion, Makati"
          />
        </div>
      )}

      <div>
        <label className="font-pixel text-xs text-[#3A0030] block mb-1" style={{ fontSize: '12px' }}>MAX PARTICIPANTS</label>
        <input
          type="number"
          min={1}
          max={500}
          value={maxParticipants}
          onChange={(e) => setMaxParticipants(Number(e.target.value))}
          className="input-y2k w-32"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-y2k w-full py-3">
        {loading ? 'creating...' : 'create hangout ✦'}
      </button>
    </form>
  )
}
