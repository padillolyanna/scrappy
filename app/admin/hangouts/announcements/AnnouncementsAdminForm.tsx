'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase-client'
import { createAnnouncement, deleteAnnouncement, togglePin } from './actions'

const NOTE_BG: Record<string, string> = {
  pink: '#FFD6EA',
  lilac: '#E6DBFF',
  blue: '#D6EEFF',
  yellow: '#FFF3B0',
  mint: '#D9F7E6',
}

const KIND_OPTIONS = [
  { value: 'news', label: 'News' },
  { value: 'new-hangout', label: 'New Hangout' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'change', label: 'Change' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'recap', label: 'Recap' },
]

const COLOR_OPTIONS = [
  { value: 'pink', label: 'Pink', bg: '#FFD6EA' },
  { value: 'lilac', label: 'Lilac', bg: '#E6DBFF' },
  { value: 'blue', label: 'Blue', bg: '#D6EEFF' },
  { value: 'yellow', label: 'Yellow', bg: '#FFF3B0' },
  { value: 'mint', label: 'Mint', bg: '#D9F7E6' },
]

type Hangout = { id: string; title: string; start_at: string }
type AnnouncementRow = {
  id: string
  title: string
  body: string
  kind: string
  note_color: string
  is_pinned: boolean
  publish_at: string
  expires_at: string | null
  scheduled: boolean
  expired: boolean
  hangout: { id: string; title: string } | null
}

function toLocalDatetime(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const da = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${mo}-${da}T${h}:${mi}`
}

function NotePreview({ title, body, kind, noteColor, isPinned, imagePreview }: {
  title: string; body: string; kind: string; noteColor: string; isPinned: boolean; imagePreview?: string | null
}) {
  const bg = NOTE_BG[noteColor] ?? NOTE_BG.pink
  const kindLabels: Record<string, string> = {
    'new-hangout': '✦ NEW HANGOUT',
    'reminder': '⏰ REMINDER',
    'change': '✎ CHANGE',
    'cancelled': '✕ CANCELLED',
    'recap': '♡ RECAP',
    'news': '★ NEWS',
  }
  return (
    <div style={{
      background: bg,
      backgroundImage: 'repeating-linear-gradient(transparent 0 23px, rgba(43,10,46,.08) 23px 24px)',
      border: '2px solid #2B0A2E',
      borderRadius: 3,
      boxShadow: '4px 4px 0 rgba(43,10,46,.25)',
      padding: '28px 14px 14px',
      position: 'relative',
      minHeight: 120,
    }}>
      {isPinned ? (
        <div style={{
          position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%) rotate(-2deg)',
          background: '#FFE14D', border: '1.5px solid #2B0A2E', borderRadius: 3,
          padding: '1px 6px', fontFamily: "'Silkscreen', monospace", fontSize: 9,
          color: '#2B0A2E', whiteSpace: 'nowrap', boxShadow: '1px 1px 0 rgba(0,0,0,.2)',
        }}>PINNED</div>
      ) : (
        <div style={{
          position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
          width: 16, height: 16, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #FF4FA3cc, #FF4FA3)',
          border: '2px solid #2B0A2E', boxShadow: '0 2px 4px rgba(0,0,0,.3)',
        }} />
      )}
      <div style={{ fontFamily: "'Silkscreen', monospace", fontSize: 9, color: '#7C4DDB', marginBottom: 6 }}>
        {kindLabels[kind] ?? kind}
      </div>
      {imagePreview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imagePreview} alt="" style={{ width: '100%', borderRadius: 4, marginBottom: 8, display: 'block', border: '1.5px solid rgba(43,10,46,.1)' }} />
      )}
      <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 16, color: '#2B0A2E', marginBottom: 6 }}>
        {title || 'your title here'}
      </div>
      <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: '#3A0030' }}>
        {body || 'your announcement body...'}
      </div>
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, background: 'linear-gradient(225deg, rgba(43,10,46,.15) 50%, transparent 50%)' }} />
    </div>
  )
}

const inputCls = 'w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-gray-900'
const labelCls = 'text-xs font-medium text-gray-700 block mb-1'

export default function AnnouncementsAdminForm({
  hangouts,
  announcements,
}: {
  hangouts: Hangout[]
  announcements: AnnouncementRow[]
}) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [kind, setKind] = useState('news')
  const [hangoutId, setHangoutId] = useState('')
  const [noteColor, setNoteColor] = useState('pink')
  const [isPinned, setIsPinned] = useState(false)
  const [publishAt, setPublishAt] = useState(toLocalDatetime(new Date().toISOString()))
  const [expiresAt, setExpiresAt] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setImageFile(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setImagePreview(url)
    } else {
      setImagePreview(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setImageUploading(!!imageFile)

    let uploadedImageUrl: string | null = null
    if (imageFile) {
      try {
        const supabase = createClient()
        const ext = imageFile.name.split('.').pop() ?? 'jpg'
        const filename = `${Date.now()}-${imageFile.name.replace(/[^a-z0-9.]/gi, '_')}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('announcements')
          .upload(filename, imageFile, { contentType: imageFile.type, upsert: false })
        if (uploadErr) throw uploadErr
        const { data: { publicUrl } } = supabase.storage.from('announcements').getPublicUrl(filename)
        uploadedImageUrl = publicUrl
      } catch (err) {
        setImageUploading(false)
        setError(err instanceof Error ? err.message : 'Image upload failed.')
        return
      }
    }
    setImageUploading(false)

    startTransition(async () => {
      try {
        const fd = new FormData()
        fd.set('title', title)
        fd.set('body', body)
        fd.set('kind', kind)
        fd.set('hangout_id', hangoutId)
        fd.set('note_color', noteColor)
        fd.set('is_pinned', String(isPinned))
        fd.set('publish_at', publishAt)
        fd.set('expires_at', expiresAt)
        if (uploadedImageUrl) fd.set('image_url', uploadedImageUrl)
        await createAnnouncement(fd)
        setSuccess(true)
        setTitle('')
        setBody('')
        setKind('news')
        setHangoutId('')
        setNoteColor('pink')
        setIsPinned(false)
        setPublishAt(toLocalDatetime(new Date().toISOString()))
        setExpiresAt('')
        setImageFile(null)
        setImagePreview(null)
        setTimeout(() => setSuccess(false), 3000)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this announcement?')) return
    setDeletingId(id)
    startTransition(async () => {
      try {
        await deleteAnnouncement(id)
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Delete failed.')
      } finally {
        setDeletingId(null)
      }
    })
  }

  function handleTogglePin(id: string, current: boolean) {
    setTogglingId(id)
    startTransition(async () => {
      try {
        await togglePin(id, current)
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Toggle failed.')
      } finally {
        setTogglingId(null)
      }
    })
  }

  return (
    <div>
      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        {/* Form */}
        <div className="bg-white rounded border border-gray-200 p-6">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">New announcement</div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-700 mb-4">
              Announcement created!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Title * <span className="text-gray-400 font-normal">({title.length}/80)</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 80))}
                required
                minLength={3}
                maxLength={80}
                className={inputCls}
                placeholder="e.g. Scrapbook night is on this Friday!"
              />
            </div>

            <div>
              <label className={labelCls}>Body * <span className="text-gray-400 font-normal">({body.length}/600)</span></label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value.slice(0, 600))}
                required
                minLength={1}
                maxLength={600}
                rows={4}
                className={inputCls}
                placeholder="Share the announcement details..."
              />
            </div>

            <div>
              <label className={labelCls}>Flyer image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 bg-white cursor-pointer"
              />
              {imagePreview && (
                <div className="mt-2 relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="" className="max-h-28 rounded border border-gray-200 block" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null) }}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-700"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Kind</label>
                <select value={kind} onChange={(e) => setKind(e.target.value)} className={inputCls}>
                  {KIND_OPTIONS.map((k) => (
                    <option key={k.value} value={k.value}>{k.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Linked hangout</label>
                <select value={hangoutId} onChange={(e) => setHangoutId(e.target.value)} className={inputCls}>
                  <option value="">— none —</option>
                  {hangouts.map((h) => (
                    <option key={h.id} value={h.id}>{h.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Note color</label>
              <div className="flex gap-3 mt-1">
                {COLOR_OPTIONS.map((c) => (
                  <label key={c.value} className="flex flex-col items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="note_color"
                      value={c.value}
                      checked={noteColor === c.value}
                      onChange={() => setNoteColor(c.value)}
                      className="sr-only"
                    />
                    <span
                      style={{ background: c.bg }}
                      className={`w-7 h-7 rounded-full border-2 block ${noteColor === c.value ? 'border-gray-900 ring-2 ring-gray-400' : 'border-gray-300'}`}
                    />
                    <span className="text-xs text-gray-500">{c.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is-pinned"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="is-pinned" className="text-xs text-gray-700">Pin this announcement</label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Publish at *</label>
                <input
                  type="datetime-local"
                  value={publishAt}
                  onChange={(e) => setPublishAt(e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Expires at (optional)</label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || imageUploading}
              className="w-full bg-gray-900 text-white text-sm px-4 py-2.5 rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {imageUploading ? 'Uploading image...' : isPending ? 'Posting...' : 'Post announcement'}
            </button>
          </form>
        </div>

        {/* Live preview */}
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Live preview</div>
          <div style={{
            background: '#D9A86C',
            backgroundImage: 'radial-gradient(rgba(90,50,20,.25) 1px, transparent 1.5px), radial-gradient(rgba(255,255,255,.18) 1px, transparent 1.5px)',
            backgroundSize: '9px 9px, 11px 11px',
            backgroundPosition: '0 0, 4px 5px',
            border: '6px solid #8A5A2B',
            borderTopColor: '#B07A45',
            padding: '32px 20px 20px',
          }}>
            <NotePreview
              title={title}
              body={body}
              kind={kind}
              noteColor={noteColor}
              isPinned={isPinned}
              imagePreview={imagePreview}
            />
          </div>
        </div>
      </div>

      {/* Announcements table */}
      <div className="bg-white rounded border border-gray-200">
        <div className="px-5 py-3 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
          All announcements ({announcements.length})
        </div>
        {announcements.length === 0 ? (
          <div className="text-sm text-gray-400 text-center py-10">
            No announcements yet. Create the first one!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Kind</th>
                  <th className="px-4 py-3">Color</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Published</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {announcements.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 max-w-[220px]">
                      <div className="font-medium text-gray-900 truncate">{a.title}</div>
                      {a.hangout && <div className="text-xs text-gray-400 mt-0.5">@ {a.hangout.title}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{a.kind}</td>
                    <td className="px-4 py-3">
                      <span
                        style={{ background: NOTE_BG[a.note_color] ?? '#FFD6EA' }}
                        className="inline-block w-4 h-4 rounded-full border border-gray-300 align-middle"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {a.is_pinned && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">pinned</span>
                        )}
                        {a.scheduled && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">scheduled</span>
                        )}
                        {a.expired && (
                          <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">expired</span>
                        )}
                        {!a.scheduled && !a.expired && (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">live</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(a.publish_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleTogglePin(a.id, a.is_pinned)}
                          disabled={togglingId === a.id}
                          className={`text-xs px-2.5 py-1 rounded border transition-colors ${a.is_pinned ? 'bg-amber-100 border-amber-300 text-amber-700 hover:bg-amber-200' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                        >
                          {a.is_pinned ? 'Unpin' : 'Pin'}
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          disabled={deletingId === a.id}
                          className="text-xs px-2.5 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
