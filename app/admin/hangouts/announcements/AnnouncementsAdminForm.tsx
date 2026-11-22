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
  { value: 'news', label: '★ News' },
  { value: 'new-hangout', label: '✦ New Hangout' },
  { value: 'reminder', label: '⏰ Reminder' },
  { value: 'change', label: '✎ Change' },
  { value: 'cancelled', label: '✕ Cancelled' },
  { value: 'recap', label: '♡ Recap' },
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
      {/* Two-column layout: form + preview */}
      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        {/* Form */}
        <div>
          <div className="font-pixel text-xs text-[#3A0030] mb-4" style={{ fontSize: '12px' }}>CREATE ANNOUNCEMENT</div>
          {error && (
            <div style={{ background: '#FFF0F0', border: '1.5px solid #FF4FA3', borderRadius: 8, padding: '12px 16px', fontFamily: 'Verdana, sans-serif', fontSize: 13, color: '#D4006E', marginBottom: 16 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#F0FFF4', border: '1.5px solid #28C840', borderRadius: 8, padding: '12px 16px', fontFamily: 'Verdana, sans-serif', fontSize: 13, color: '#1A6E2B', marginBottom: 16 }}>
              Announcement created!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-pixel text-xs text-[#3A0030] block mb-1" style={{ fontSize: '12px' }}>TITLE * <span style={{ color: '#888' }}>({title.length}/80)</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 80))}
                required
                minLength={3}
                maxLength={80}
                className="input-y2k w-full"
                placeholder="e.g. Scrapbook night is on this Friday!"
              />
            </div>

            <div>
              <label className="font-pixel text-xs text-[#3A0030] block mb-1" style={{ fontSize: '12px' }}>BODY * <span style={{ color: '#888' }}>({body.length}/600)</span></label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value.slice(0, 600))}
                required
                minLength={1}
                maxLength={600}
                rows={4}
                className="input-y2k w-full"
                placeholder="Share the announcement details..."
              />
            </div>

            <div>
              <label className="font-pixel text-xs text-[#3A0030] block mb-1" style={{ fontSize: '12px' }}>FLYER IMAGE (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="input-y2k w-full"
                style={{ padding: '6px 10px', cursor: 'pointer' }}
              />
              {imagePreview && (
                <div style={{ marginTop: 8, position: 'relative', display: 'inline-block' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="" style={{ maxHeight: 120, borderRadius: 4, border: '1.5px solid #FFB6D9', display: 'block' }} />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null) }}
                    style={{ position: 'absolute', top: 4, right: 4, background: '#D7263D', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-pixel text-xs text-[#3A0030] block mb-1" style={{ fontSize: '12px' }}>KIND</label>
                <select value={kind} onChange={(e) => setKind(e.target.value)} className="input-y2k w-full">
                  {KIND_OPTIONS.map((k) => (
                    <option key={k.value} value={k.value}>{k.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-pixel text-xs text-[#3A0030] block mb-1" style={{ fontSize: '12px' }}>LINKED HANGOUT</label>
                <select value={hangoutId} onChange={(e) => setHangoutId(e.target.value)} className="input-y2k w-full">
                  <option value="">— none —</option>
                  {hangouts.map((h) => (
                    <option key={h.id} value={h.id}>{h.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-pixel text-xs text-[#3A0030] block mb-2" style={{ fontSize: '12px' }}>NOTE COLOR</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {COLOR_OPTIONS.map((c) => (
                  <label key={c.value} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="note_color"
                      value={c.value}
                      checked={noteColor === c.value}
                      onChange={() => setNoteColor(c.value)}
                      style={{ display: 'none' }}
                    />
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: c.bg,
                      border: noteColor === c.value ? '3px solid #2B0A2E' : '2px solid #ccc',
                      boxShadow: noteColor === c.value ? '0 0 0 2px #FF4FA3' : 'none',
                      display: 'block',
                    }} />
                    <span style={{ fontFamily: "'Silkscreen', monospace", fontSize: 8, color: '#888' }}>{c.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is-pinned"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="is-pinned" className="font-pixel text-xs text-[#3A0030]" style={{ fontSize: '12px' }}>
                PIN THIS ANNOUNCEMENT
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-pixel text-xs text-[#3A0030] block mb-1" style={{ fontSize: '12px' }}>PUBLISH AT *</label>
                <input
                  type="datetime-local"
                  value={publishAt}
                  onChange={(e) => setPublishAt(e.target.value)}
                  required
                  className="input-y2k w-full"
                />
              </div>
              <div>
                <label className="font-pixel text-xs text-[#3A0030] block mb-1" style={{ fontSize: '12px' }}>EXPIRES AT (optional)</label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="input-y2k w-full"
                />
              </div>
            </div>

            <button type="submit" disabled={isPending || imageUploading} className="btn-y2k w-full py-3">
              {imageUploading ? 'uploading image...' : isPending ? 'posting...' : 'post announcement ✦'}
            </button>
          </form>
        </div>

        {/* Live preview */}
        <div>
          <div className="font-pixel text-xs text-[#3A0030] mb-4" style={{ fontSize: '12px' }}>LIVE PREVIEW</div>
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
      <div>
        <div className="font-pixel text-xs text-[#3A0030] mb-4" style={{ fontSize: '12px' }}>ALL ANNOUNCEMENTS ({announcements.length})</div>
        {announcements.length === 0 ? (
          <div className="font-caveat text-[#888] text-center py-8" style={{ fontFamily: 'Caveat, cursive', fontSize: 20 }}>
            No announcements yet. Create the first one!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Nunito, sans-serif', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#3A0030', color: '#FFB6D9' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontFamily: "'Silkscreen', monospace", fontSize: 10 }}>TITLE</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontFamily: "'Silkscreen', monospace", fontSize: 10 }}>KIND</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontFamily: "'Silkscreen', monospace", fontSize: 10 }}>COLOR</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontFamily: "'Silkscreen', monospace", fontSize: 10 }}>STATUS</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontFamily: "'Silkscreen', monospace", fontSize: 10 }}>PUBLISHED</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontFamily: "'Silkscreen', monospace", fontSize: 10 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((a, i) => (
                  <tr key={a.id} style={{ background: i % 2 === 0 ? '#fff' : '#FFF0F7', borderBottom: '1px solid #FFB6D9' }}>
                    <td style={{ padding: '8px 12px', maxWidth: 240 }}>
                      <div style={{ fontWeight: 700, color: '#2B0A2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
                      {a.hangout && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>@ {a.hangout.title}</div>}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ fontFamily: "'Silkscreen', monospace", fontSize: 9, color: '#7C4DDB' }}>{a.kind}</span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: NOTE_BG[a.note_color] ?? '#FFD6EA', border: '1.5px solid #2B0A2E', verticalAlign: 'middle' }} />
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {a.is_pinned && (
                          <span style={{ background: '#FFE14D', border: '1px solid #2B0A2E', borderRadius: 3, padding: '1px 5px', fontFamily: "'Silkscreen', monospace", fontSize: 8, color: '#2B0A2E' }}>
                            PINNED
                          </span>
                        )}
                        {a.scheduled && (
                          <span style={{ background: '#E0E7FF', border: '1px solid #7C4DDB', borderRadius: 3, padding: '1px 5px', fontFamily: "'Silkscreen', monospace", fontSize: 8, color: '#7C4DDB' }}>
                            SCHEDULED
                          </span>
                        )}
                        {a.expired && (
                          <span style={{ background: '#FFF0F0', border: '1px solid #FF4FA3', borderRadius: 3, padding: '1px 5px', fontFamily: "'Silkscreen', monospace", fontSize: 8, color: '#D7263D' }}>
                            EXPIRED
                          </span>
                        )}
                        {!a.scheduled && !a.expired && (
                          <span style={{ background: '#D9F7E6', border: '1px solid #28C840', borderRadius: 3, padding: '1px 5px', fontFamily: "'Silkscreen', monospace", fontSize: 8, color: '#1A6E2B' }}>
                            LIVE
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', fontSize: 11, color: '#888', whiteSpace: 'nowrap' }}>
                      {new Date(a.publish_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button
                          onClick={() => handleTogglePin(a.id, a.is_pinned)}
                          disabled={togglingId === a.id}
                          style={{
                            fontFamily: "'Silkscreen', monospace", fontSize: 9,
                            padding: '3px 7px', borderRadius: 3,
                            background: a.is_pinned ? '#FFE14D' : '#f5f5f5',
                            border: '1.5px solid #2B0A2E',
                            cursor: 'pointer', color: '#2B0A2E',
                          }}
                        >
                          {a.is_pinned ? 'UNPIN' : 'PIN'}
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          disabled={deletingId === a.id}
                          style={{
                            fontFamily: "'Silkscreen', monospace", fontSize: 9,
                            padding: '3px 7px', borderRadius: 3,
                            background: '#FFF0F0', border: '1.5px solid #D7263D',
                            cursor: 'pointer', color: '#D7263D',
                          }}
                        >
                          DEL
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
