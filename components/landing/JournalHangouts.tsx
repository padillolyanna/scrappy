import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'

interface Hangout {
  id: string
  title: string
  description: string | null
  category: string
  start_at: string
  event_type: string
  max_participants: number
  profiles: { username: string } | null
  rsvp_count: number
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

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-PH', {
    timeZone: 'Asia/Manila',
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  }) + ' · ' + d.toLocaleTimeString('en-PH', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }) + ' PHT'
}

function HangoutTicket({ hangout, featured = false }: { hangout: Hangout; featured?: boolean }) {
  const catColor = CATEGORY_COLORS[hangout.category] ?? '#FFB6D9'
  const catLabel = CATEGORY_LABELS[hangout.category] ?? hangout.category
  const spotsFull = hangout.rsvp_count >= hangout.max_participants

  return (
    <Link href={`/hangouts/${hangout.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div style={{
        background: '#fff',
        border: '2px solid #FFB6D9',
        borderLeft: `5px solid ${catColor}`,
        borderRadius: 8,
        padding: featured ? '18px 20px' : '12px 16px',
        boxShadow: '2px 2px 0 #2B0A2E',
        cursor: 'pointer',
        transition: 'transform 0.1s',
        height: '100%',
      }} className="hover:scale-[1.01]">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{
            background: catColor, color: '#fff',
            fontFamily: "'Silkscreen', monospace", fontSize: 10,
            padding: '1px 7px', borderRadius: 3, border: '1px solid #2B0A2E',
          }}>
            {catLabel}
          </span>
          {spotsFull && (
            <span style={{
              fontFamily: "'Silkscreen', monospace", fontSize: 10, color: '#FF4FA3',
              border: '1px solid #FF4FA3', padding: '1px 6px', borderRadius: 3,
            }}>FULL</span>
          )}
        </div>

        <div style={{
          fontFamily: 'Pacifico, cursive',
          fontSize: featured ? 20 : 15,
          color: '#3A0030',
          marginBottom: 4,
          lineHeight: 1.3,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {hangout.title}
        </div>

        {featured && hangout.description && (
          <p style={{
            fontFamily: 'Verdana, sans-serif', fontSize: 12, color: '#666',
            lineHeight: 1.6, marginBottom: 8,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {hangout.description}
          </p>
        )}

        <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 11, color: '#888', marginBottom: 4 }}>
          📅 {formatDateShort(hangout.start_at)}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          {hangout.profiles?.username && (
            <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 11, color: '#FF4FA3' }}>
              ♡ @{hangout.profiles.username}
            </div>
          )}
          <div style={{ fontFamily: "'Silkscreen', monospace", fontSize: 10, color: '#aaa' }}>
            {hangout.rsvp_count}/{hangout.max_participants}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default async function JournalHangouts() {
  const supabase = await createClient()

  const { data: hangoutsRaw } = await supabase
    .from('hangouts')
    .select('id, title, description, category, start_at, event_type, max_participants, profiles(username)')
    .in('status', ['upcoming', 'registration_open'])
    .gt('start_at', new Date().toISOString())
    .order('start_at', { ascending: true })
    .limit(3)

  type HangoutRow = {
    id: string; title: string; description: string | null; category: string;
    start_at: string; event_type: string; max_participants: number;
    profiles: { username: string } | { username: string }[] | null
  }

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
      start_at: row.start_at,
      event_type: row.event_type,
      max_participants: row.max_participants,
      profiles: Array.isArray(row.profiles) ? row.profiles[0] : row.profiles,
      rsvp_count: rsvpCounts[row.id] ?? 0,
    }
  })

  const featured = hangouts[0] ?? null
  const rest = hangouts.slice(1)

  return (
    <section style={{ padding: '20px 20px 0' }}>
      <div className="panel-header" style={{ marginBottom: 0 }}>
        journal hangouts ♡
      </div>
      <div className="widget-box" style={{ padding: '16px' }}>
        <div className="flex justify-between items-center mb-4">
          <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: '#888' }}>
            upcoming community get-togethers
          </span>
          <Link href="/hangouts" style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: '#FF4FA3', textDecoration: 'underline' }}>
            VIEW ALL →
          </Link>
        </div>

        {hangouts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div className="font-caveat text-xl text-[#888]" style={{ fontFamily: 'Caveat, cursive' }}>
              Nothing on the calendar just yet! Check back soon. ♡
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Featured */}
            {featured && <HangoutTicket hangout={featured} featured />}

            {/* Rest */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rest.map((h) => (
                  <HangoutTicket key={h.id} hangout={h} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
