import { createClient } from './supabase-server'

export type Announcement = {
  id: string
  title: string
  body: string
  kind: 'new-hangout' | 'reminder' | 'change' | 'cancelled' | 'recap' | 'news'
  note_color: 'pink' | 'lilac' | 'blue' | 'yellow' | 'mint'
  is_pinned: boolean
  publish_at: string
  image_url?: string | null
  hangout: { id: string; title: string; start_at: string; status: string } | null
}

export type AnnouncementWithMeta = Announcement & { isNew: boolean; when: string }

export function formatDatePHT(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }) + ' PHT'
}

export function isNewAnnouncement(publishAt: string): boolean {
  const ago72 = Date.now() - 72 * 60 * 60 * 1000
  return new Date(publishAt).getTime() >= ago72
}

export async function getLiveAnnouncements({ limit = 12, hangoutId }: { limit?: number; hangoutId?: string } = {}): Promise<AnnouncementWithMeta[]> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  let query = supabase
    .from('hangout_announcements')
    .select('id, title, body, kind, note_color, is_pinned, publish_at, image_url, hangouts(id, title, start_at, status)')
    .lte('publish_at', now)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('is_pinned', { ascending: false })
    .order('publish_at', { ascending: false })
    .limit(limit)

  if (hangoutId) {
    query = (query as typeof query).eq('hangout_id', hangoutId)
  }

  const { data } = await query

  return (data ?? []).map((a) => {
    type HangoutRef = { id: string; title: string; start_at: string; status: string }
    const rawHangout = a.hangouts as HangoutRef | HangoutRef[] | null
    const hangout = Array.isArray(rawHangout) ? (rawHangout[0] ?? null) : (rawHangout ?? null)
    return {
      id: a.id,
      title: a.title,
      body: a.body,
      kind: a.kind as Announcement['kind'],
      note_color: a.note_color as Announcement['note_color'],
      is_pinned: a.is_pinned,
      publish_at: a.publish_at,
      image_url: (a as typeof a & { image_url?: string | null }).image_url ?? null,
      hangout: hangout ? { id: hangout.id, title: hangout.title, start_at: hangout.start_at, status: hangout.status } : null,
      isNew: isNewAnnouncement(a.publish_at),
      when: formatDatePHT(a.publish_at),
    }
  })
}

export async function getAllAnnouncementsAdmin(): Promise<(AnnouncementWithMeta & { expires_at: string | null; scheduled: boolean; expired: boolean })[]> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data } = await supabase
    .from('hangout_announcements')
    .select('id, title, body, kind, note_color, is_pinned, publish_at, expires_at, image_url, hangouts(id, title, start_at, status)')
    .order('is_pinned', { ascending: false })
    .order('publish_at', { ascending: false })

  return (data ?? []).map((a) => {
    type HangoutRef = { id: string; title: string; start_at: string; status: string }
    const rawHangout = a.hangouts as HangoutRef | HangoutRef[] | null
    const hangout = Array.isArray(rawHangout) ? (rawHangout[0] ?? null) : (rawHangout ?? null)
    const scheduled = a.publish_at > now
    const expired = a.expires_at != null && a.expires_at <= now
    return {
      id: a.id,
      title: a.title,
      body: a.body,
      kind: a.kind as Announcement['kind'],
      note_color: a.note_color as Announcement['note_color'],
      is_pinned: a.is_pinned,
      publish_at: a.publish_at,
      expires_at: a.expires_at ?? null,
      image_url: (a as typeof a & { image_url?: string | null }).image_url ?? null,
      hangout: hangout ? { id: hangout.id, title: hangout.title, start_at: hangout.start_at, status: hangout.status } : null,
      isNew: isNewAnnouncement(a.publish_at),
      when: formatDatePHT(a.publish_at),
      scheduled,
      expired,
    }
  })
}
