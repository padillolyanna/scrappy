'use client'

import { useState } from 'react'
import { uploadBoardImage } from '@/lib/boardImage'
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

const inputCls = 'w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-gray-900'
const labelCls = 'text-xs font-medium text-gray-700 block mb-1'

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
  const [pinNote, setPinNote] = useState(true)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
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

      const coverUrl = coverFile ? await uploadBoardImage(coverFile, 'hangouts') : null

      const { data: insertData, error: insertErr } = await supabase.from('hangouts').insert({
        title,
        description: description || null,
        cover_url: coverUrl,
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
      }).select('id').single()

      if (insertErr) throw insertErr

      if (pinNote) {
        const annoBody = description.trim().length > 0
          ? description.trim().slice(0, 200)
          : 'a new journal hangout is on the calendar ✦'

        await supabase.from('hangout_announcements').insert({
          title,
          body: annoBody,
          kind: 'new-hangout',
          hangout_id: insertData?.id ?? null,
          note_color: 'pink',
          is_pinned: false,
          image_url: coverUrl,
          created_by: user.id,
        })
      }

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
      <div className="bg-green-50 border border-green-200 rounded p-4 text-sm text-green-700 text-center">
        Hangout created! Redirecting...
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className={labelCls}>Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={inputCls}
          placeholder="e.g. Scrapbook Night with the girls"
        />
      </div>

      <div>
        <label className={labelCls}>Cover picture (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null
            setCoverFile(f)
            setCoverPreview(f ? URL.createObjectURL(f) : null)
          }}
          className="text-sm text-gray-700"
        />
        <p className="text-xs text-gray-400 mt-1">A flyer or a photo of the venue. Shown on the hangout card, its page and the board note. Max 5 MB.</p>
        {coverPreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverPreview} alt="" className="mt-2 max-h-32 rounded border border-gray-200 block" />
        )}
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputCls}
          rows={4}
          placeholder="Tell people what to expect..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Event type</label>
          <select value={eventType} onChange={(e) => setEventType(e.target.value)} className={inputCls}>
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Start date & time *</label>
          <input
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>End date & time</label>
          <input
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {(eventType === 'online' || eventType === 'hybrid') && (
        <div>
          <label className={labelCls}>Meeting URL</label>
          <input
            type="url"
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            className={inputCls}
            placeholder="https://meet.google.com/..."
          />
        </div>
      )}

      {(eventType === 'in-person' || eventType === 'hybrid') && (
        <div>
          <label className={labelCls}>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputCls}
            placeholder="e.g. Poblacion, Makati"
          />
        </div>
      )}

      <div>
        <label className={labelCls}>Max participants</label>
        <input
          type="number"
          min={1}
          max={500}
          value={maxParticipants}
          onChange={(e) => setMaxParticipants(Number(e.target.value))}
          className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 bg-white w-32 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="pin-note"
          checked={pinNote}
          onChange={(e) => setPinNote(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="pin-note" className="text-xs text-gray-700">
          Post a &ldquo;New Hangout&rdquo; note on the announcement board
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-900 text-white text-sm px-4 py-2.5 rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Creating...' : 'Create hangout'}
      </button>
    </form>
  )
}
