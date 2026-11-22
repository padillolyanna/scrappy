export const instant = false

import { createClient } from '@/lib/supabase-server'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { getLiveAnnouncements } from '@/lib/announcements'
import AnnouncementBoard from '@/components/hangouts/AnnouncementBoard'

interface Hangout {
  id: string
  title: string
  description: string | null
  category: string
  host_id: string | null
  start_at: string
  end_at: string | null
  event_type: string
  max_participants: number
  status: string
  profiles: { username: string } | null
  rsvp_count: number
}

const CATEGORY_LABELS: Record<string, string> = {
  'scrapbook-night': 'Scrapbook Night',
  'journal-with-me': 'Journal With Me',
  'photobooth-party': 'Photobooth Party',
  'exchange-meetup': 'Exchange Meetup',
  'theme-week': 'Theme Week',
  'memory-sharing': 'Memory Sharing',
  'workshop': 'Workshop',
  'general': 'General',
}

const CATEGORY_COLORS: Record<string, string> = {
  'scrapbook-night': '#FF4FA3',
  'journal-with-me': '#7C4DDB',
  'photobooth-party': '#FF6B00',
  'exchange-meetup': '#6FE3FF',
  'theme-week': '#FFD700',
  'memory-sharing': '#28C840',
  'workshop': '#C9A2FF',
  'general': '#FFB6D9',
}

function formatDatePHT(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }) + ' PHT'
}

function HangoutCard({ hangout, featured = false }: { hangout: Hangout; featured?: boolean }) {
  const catColor = CATEGORY_COLORS[hangout.category] ?? '#FFB6D9'
  const catLabel = CATEGORY_LABELS[hangout.category] ?? hangout.category
  const spotsFull = hangout.rsvp_count >= hangout.max_participants
  const spotsLeft = hangout.max_participants - hangout.rsvp_count

  return (
    <Link href={`/hangouts/${hangout.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div
        style={{
          background: '#fff',
          border: '2px solid #FFB6D9',
          borderRadius: 8,
          padding: featured ? 24 : 16,
          boxShadow: '3px 3px 0 #2B0A2E',
          cursor: 'pointer',
          transition: 'transform 0.1s, box-shadow 0.1s',
          height: '100%',
        }}
        className="hover:scale-[1.01]"
      >
        {/* Category badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{
            background: catColor,
            color: '#fff',
            fontFamily: "'Silkscreen', monospace",
            fontSize: 10,
            padding: '2px 8px',
            borderRadius: 4,
            border: '1.5px solid #2B0A2E',
            letterSpacing: '0.05em',
          }}>
            {catLabel}
          </span>
          <span style={{
            fontFamily: "'Silkscreen', monospace",
            fontSize: 10,
            color: spotsFull ? '#FF4FA3' : '#28C840',
            padding: '2px 6px',
            border: `1px solid ${spotsFull ? '#FF4FA3' : '#28C840'}`,
            borderRadius: 4,
          }}>
            {spotsFull ? 'FULL' : `${spotsLeft} spots`}
          </span>
        </div>

        <h3 style={{
          fontFamily: 'Pacifico, cursive',
          fontSize: featured ? 26 : 18,
          color: '#3A0030',
          marginBottom: 6,
          lineHeight: 1.3,
        }}>
          {hangout.title}
        </h3>

        {hangout.description && (
          <p style={{
            fontFamily: 'Verdana, sans-serif',
            fontSize: 12,
            color: '#666',
            marginBottom: 10,
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: featured ? 3 : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {hangout.description}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
          <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 12, color: '#3A0030' }}>
            <span style={{ color: '#FF4FA3', fontWeight: 'bold' }}>📅 </span>
            {formatDatePHT(hangout.start_at)}
          </div>
          {hangout.profiles?.username && (
            <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 12, color: '#888' }}>
              <span style={{ color: '#FF4FA3' }}>♡ </span>hosted by @{hangout.profiles.username}
            </div>
          )}
          <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 12, color: '#888' }}>
            <span style={{ color: '#7C4DDB' }}>✦ </span>
            {hangout.event_type === 'online' ? 'online event' : hangout.event_type === 'in-person' ? 'in-person event' : 'hybrid event'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: "'Silkscreen', monospace", fontSize: 11, color: '#888' }}>
            {hangout.rsvp_count}/{hangout.max_participants} going
          </div>
          <span className="btn-y2k" style={{ fontSize: 11, padding: '4px 12px' }}>
            {spotsFull ? 'join waitlist' : 'RSVP ✦'}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default async function HangoutsPage() {
  const supabase = await createClient()

  const announcements = await getLiveAnnouncements({ limit: 12 })

  const { data: hangoutsRaw } = await supabase
    .from('hangouts')
    .select('id, title, description, category, host_id, start_at, end_at, event_type, max_participants, status, profiles(username)')
    .in('status', ['upcoming', 'registration_open'])
    .gt('start_at', new Date().toISOString())
    .order('start_at', { ascending: true })
    .limit(20)

  type HangoutRow = {
    id: string; title: string; description: string | null; category: string;
    host_id: string | null; start_at: string; end_at: string | null; event_type: string;
    max_participants: number; status: string; profiles: { username: string } | { username: string }[] | null
  }

  // Get RSVP counts
  const hangoutIds = (hangoutsRaw ?? []).map((h) => h.id)
  let rsvpCounts: Record<string, number> = {}
  if (hangoutIds.length > 0) {
    const { data: rsvps } = await supabase
      .from('hangout_rsvps')
      .select('hangout_id')
      .in('hangout_id', hangoutIds)
      .eq('status', 'confirmed')
    for (const r of rsvps ?? []) {
      rsvpCounts[r.hangout_id] = (rsvpCounts[r.hangout_id] ?? 0) + 1
    }
  }

  const hangouts: Hangout[] = (hangoutsRaw ?? []).map((h) => {
    const row = h as unknown as HangoutRow
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      host_id: row.host_id,
      start_at: row.start_at,
      end_at: row.end_at,
      event_type: row.event_type,
      max_participants: row.max_participants,
      status: row.status,
      profiles: Array.isArray(row.profiles) ? row.profiles[0] : row.profiles,
      rsvp_count: rsvpCounts[row.id] ?? 0,
    }
  })

  const featured = hangouts[0] ?? null
  const rest = hangouts.slice(1)

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="font-pixel text-xs text-[#FF4FA3] mb-2 tracking-widest" style={{ fontSize: '12px' }}>
            ✦ COMMUNITY EVENTS ✦
          </div>
          <h1 className="font-pacifico text-5xl text-[#3A0030]" style={{ fontFamily: 'Pacifico, cursive', fontSize: 'clamp(28px, 6vw, 48px)' }}>
            journal hangouts
          </h1>
          <p className="font-caveat text-xl text-[#888] mt-2" style={{ fontFamily: 'Caveat, cursive' }}>
            gather &amp; create together ♡
          </p>
        </div>

        <AnnouncementBoard announcements={announcements} variant="full" />

        {hangouts.length === 0 ? (
          <div className="window-chrome overflow-hidden rounded-lg shadow-xl">
            <div className="window-title-bar">
              <span>hangouts.exe — community calendar</span>
              <div className="flex gap-1">
                <span className="window-btn">_</span>
                <span className="window-btn">□</span>
                <span className="window-btn">x</span>
              </div>
            </div>
            <div className="bg-white p-10 text-center">
              <div className="font-pixel text-4xl text-[#FFB6D9] mb-4">♡</div>
              <div className="font-caveat text-2xl text-[#888]" style={{ fontFamily: 'Caveat, cursive' }}>
                Nothing on the calendar just yet! Check back soon.
              </div>
              <div className="font-caveat text-xl text-[#aaa] mt-2" style={{ fontFamily: 'Caveat, cursive' }}>
                We&apos;re planning something fun. ♡
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured hangout */}
            {featured && (
              <div>
                <div className="panel-header mb-0">next up ✦</div>
                <div className="widget-box p-4">
                  <HangoutCard hangout={featured} featured />
                </div>
              </div>
            )}

            {/* Rest grid */}
            {rest.length > 0 && (
              <div>
                <div className="panel-header mb-0">coming up ✦</div>
                <div className="widget-box p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rest.map((h) => (
                      <HangoutCard key={h.id} hangout={h} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
