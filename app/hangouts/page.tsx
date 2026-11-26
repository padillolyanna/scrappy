import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Journal Hangouts — Scrappy',
  description: 'Community journal events where people write, share prompts and scrapbook together. See what is coming up on the hangout board.',
  alternates: { canonical: 'https://www.scrappy.fun/hangouts' },
}

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
  cover_url: string | null
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

function dateParts(dateStr: string) {
  const d = new Date(dateStr)
  const f = (o: Intl.DateTimeFormatOptions) => d.toLocaleString('en-PH', { timeZone: 'Asia/Manila', ...o })
  return { mon: f({ month: 'short' }).toUpperCase(), day: f({ day: 'numeric' }), dow: f({ weekday: 'short' }), time: f({ hour: 'numeric', minute: '2-digit', hour12: true }) }
}

function HangoutCard({ hangout, featured = false }: { hangout: Hangout; featured?: boolean }) {
  const catColor = CATEGORY_COLORS[hangout.category] ?? '#FFB6D9'
  const catLabel = CATEGORY_LABELS[hangout.category] ?? hangout.category
  const dp = dateParts(hangout.start_at)
  const where = hangout.event_type === 'online' ? 'online' : hangout.event_type === 'in-person' ? 'in person' : 'online + in person'

  return (
    <Link href={`/hangouts/${hangout.id}`} className={`hgc ${featured ? 'hgc--featured' : ''}`}>
      <div className="hgc-photo">
        {hangout.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hangout.cover_url} alt="" loading="lazy" />
        ) : (
          <div className="hgc-photo-empty" style={{ ['--cat' as string]: catColor }} aria-hidden="true"><span>✎ ♡ ✦</span></div>
        )}
        <div className="hgc-cal" aria-hidden="true"><b>{dp.mon}</b><span>{dp.day}</span><i>{dp.dow}</i></div>
      </div>
      <div className="hgc-body">
        <div className="hgc-tags">
          <span className="hgc-cat" style={{ ['--cat' as string]: catColor }}>{catLabel}</span>
        </div>
        <h3 className="hgc-title">{hangout.title}</h3>
        {hangout.description && <p className="hgc-desc">{hangout.description}</p>}
        <ul className="hgc-meta">
          <li><b>When</b> {formatDatePHT(hangout.start_at)}</li>
          <li><b>Where</b> {where}</li>
          {hangout.profiles?.username && <li><b>Host</b> @{hangout.profiles.username}</li>}
        </ul>
        <div className="hgc-foot">
          <span className="hgc-more">see details ♡</span>
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
    .select('id, title, description, cover_url, category, host_id, start_at, end_at, event_type, max_participants, status, profiles(username)')
    .in('status', ['upcoming', 'registration_open'])
    .gt('start_at', new Date().toISOString())
    .order('start_at', { ascending: true })
    .limit(20)

  type HangoutRow = {
    id: string; title: string; description: string | null; category: string;
    host_id: string | null; start_at: string; end_at: string | null; event_type: string;
    max_participants: number; status: string; cover_url: string | null; profiles: { username: string } | { username: string }[] | null
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
      cover_url: row.cover_url ?? null,
    }
  })

  const featured = hangouts[0] ?? null
  const rest = hangouts.slice(1)

  return (
    <div className="hgp">
      <header className="hgp-head">
        <p className="hgp-kicker">✦ community events ✦</p>
        <h1 className="hgp-title">Journal Hangouts</h1>
        <p className="hgp-sub">Meet other journalers, swap stickers and make pages together ♡</p>
      </header>

      <AnnouncementBoard announcements={announcements} variant="full" />

      {hangouts.length > 0 ? (
        <>
          {featured && (
            <section className="hgp-sec" aria-labelledby="hgp-next">
              <h2 id="hgp-next" className="hgp-h2">next up ✦</h2>
              <HangoutCard hangout={featured} featured />
            </section>
          )}
          {rest.length > 0 && (
            <section className="hgp-sec" aria-labelledby="hgp-soon">
              <h2 id="hgp-soon" className="hgp-h2">coming up</h2>
              <div className="hgp-grid">
                {rest.map((h) => <HangoutCard key={h.id} hangout={h} />)}
              </div>
            </section>
          )}
        </>
      ) : (
        <p className="hgp-empty">No hangouts on the calendar right now. Check the board above for news ♡</p>
      )}
      <Footer />
    </div>
  )
}
