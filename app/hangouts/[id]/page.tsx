export const instant = false

import { createClient } from '@/lib/supabase-server'
import Footer from '@/components/layout/Footer'
import RSVPButton from './RSVPButton'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getLiveAnnouncements } from '@/lib/announcements'
import AnnouncementNote from '@/components/hangouts/AnnouncementNote'

interface HangoutDetail {
  id: string
  title: string
  description: string | null
  category: string
  host_id: string | null
  start_at: string
  end_at: string | null
  event_type: string
  meeting_url: string | null
  location: string | null
  max_participants: number
  registration_deadline: string | null
  status: string
  profiles: { username: string } | null
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

function formatDatePHT(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }) + ' PHT'
}

export default async function HangoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: hangoutRaw } = await supabase
    .from('hangouts')
    .select('id, title, description, cover_url, category, host_id, start_at, end_at, event_type, meeting_url, location, max_participants, registration_deadline, status, profiles(username)')
    .eq('id', id)
    .maybeSingle()

  if (!hangoutRaw) notFound()

  type HangoutRow = typeof hangoutRaw & { profiles: { username: string } | { username: string }[] | null }
  const row = hangoutRaw as unknown as HangoutRow
  const hangout: HangoutDetail = {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    host_id: row.host_id,
    start_at: row.start_at,
    end_at: row.end_at,
    event_type: row.event_type,
    meeting_url: row.meeting_url,
    location: row.location,
    max_participants: row.max_participants,
    registration_deadline: row.registration_deadline,
    status: row.status,
    profiles: Array.isArray(row.profiles) ? row.profiles[0] : row.profiles,
  }

  // Get RSVP count
  const { count: confirmedCount } = await supabase
    .from('hangout_rsvps')
    .select('id', { count: 'exact', head: true })
    .eq('hangout_id', id)
    .eq('status', 'confirmed')

  // Check if current user is confirmed (to show meeting_url)
  const { data: { user } } = await supabase.auth.getUser()
  let isConfirmed = false
  if (user) {
    const { data: rsvp } = await supabase
      .from('hangout_rsvps')
      .select('status')
      .eq('hangout_id', id)
      .eq('user_id', user.id)
      .maybeSingle()
    isConfirmed = rsvp?.status === 'confirmed'
  }

  const hangoutAnnouncements = await getLiveAnnouncements({ hangoutId: id, limit: 10 })

  const catLabel = CATEGORY_LABELS[hangout.category] ?? hangout.category
  const rsvpCount = confirmedCount ?? 0

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <Link href="/hangouts" style={{ fontFamily: "'Silkscreen', monospace", fontSize: 12, color: '#FF4FA3', textDecoration: 'underline', display: 'inline-block', marginBottom: 20 }}>
          ← back to hangouts
        </Link>

        <div className="window-chrome overflow-hidden rounded-lg shadow-xl">
          <div className="window-title-bar">
            <span>hangout.exe — {hangout.title}</span>
            <div className="flex gap-1">
              <span className="window-btn">_</span>
              <span className="window-btn">□</span>
              <span className="window-btn">x</span>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8">
            {hangout.status === 'cancelled' && (
              <div style={{
                background: '#FFF0F0', border: '1.5px solid #FF4FA3', borderRadius: 8,
                padding: '12px 16px', marginBottom: 20,
                fontFamily: 'Verdana, sans-serif', fontSize: 13, color: '#D4006E', textAlign: 'center',
              }}>
                This event has been cancelled.
              </div>
            )}

            {/* Category + type tags */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{
                background: '#FF4FA3', color: '#fff',
                fontFamily: "'Silkscreen', monospace", fontSize: 10,
                padding: '2px 10px', borderRadius: 4, border: '1.5px solid #2B0A2E',
              }}>
                {catLabel}
              </span>
              <span style={{
                background: '#FFF0F7', color: '#3A0030',
                fontFamily: "'Silkscreen', monospace", fontSize: 10,
                padding: '2px 10px', borderRadius: 4, border: '1.5px solid #FFB6D9',
              }}>
                {hangout.event_type === 'online' ? 'online' : hangout.event_type === 'in-person' ? 'in-person' : 'hybrid'}
              </span>
            </div>

            {(row as unknown as { cover_url?: string | null }).cover_url && (
              <a href={(row as unknown as { cover_url: string }).cover_url} target="_blank" rel="noopener noreferrer" className="hgd-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={(row as unknown as { cover_url: string }).cover_url} alt={`picture for ${hangout.title}`} />
              </a>
            )}
            <h1 className="hgd-title">{hangout.title}</h1>

            {hangout.description && (
              <p style={{ fontFamily: 'Verdana, sans-serif', fontSize: 14, color: '#444', lineHeight: 1.7, marginBottom: 20 }}>
                {hangout.description}
              </p>
            )}

            {/* Details */}
            <div style={{
              background: '#FFF0F7', border: '1.5px solid #FFB6D9', borderRadius: 8,
              padding: '16px 20px', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: '#FF4FA3', fontSize: 16 }}>📅</span>
                <div>
                  <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 13, color: '#3A0030', fontWeight: 'bold' }}>
                    {formatDatePHT(hangout.start_at)}
                  </div>
                  {hangout.end_at && (
                    <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 12, color: '#888' }}>
                      until {formatDatePHT(hangout.end_at)}
                    </div>
                  )}
                </div>
              </div>

              {hangout.profiles?.username && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ color: '#FF4FA3', fontSize: 16 }}>♡</span>
                  <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 13, color: '#3A0030' }}>
                    hosted by <span style={{ color: '#FF4FA3', fontWeight: 'bold' }}>@{hangout.profiles.username}</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ color: '#FF4FA3', fontSize: 16 }}>✦</span>
                <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 13, color: '#3A0030' }}>
                  {rsvpCount} of {hangout.max_participants} spots filled
                </div>
              </div>

              {hangout.registration_deadline && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ color: '#FF6B00', fontSize: 16 }}>⏰</span>
                  <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 13, color: '#3A0030' }}>
                    RSVP by {formatDatePHT(hangout.registration_deadline)}
                  </div>
                </div>
              )}

              {/* Meeting URL — only show to confirmed participants */}
              {hangout.event_type !== 'in-person' && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ color: '#7C4DDB', fontSize: 16 }}>🔗</span>
                  <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 13, color: '#3A0030' }}>
                    {isConfirmed && hangout.meeting_url ? (
                      <a href={hangout.meeting_url} target="_blank" rel="noopener noreferrer" style={{ color: '#FF4FA3', textDecoration: 'underline' }}>
                        {hangout.meeting_url}
                      </a>
                    ) : (
                      <span style={{ color: '#888' }}>
                        Meeting link shared with confirmed participants
                      </span>
                    )}
                  </div>
                </div>
              )}

              {hangout.location && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 16 }}>📍</span>
                  <div style={{ fontFamily: 'Verdana, sans-serif', fontSize: 13, color: '#3A0030' }}>
                    {hangout.location}
                  </div>
                </div>
              )}
            </div>

            {/* Announcements for this hangout */}
            {hangoutAnnouncements.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div className="panel-header mb-0">updates for this hangout ✦</div>
                <div className="widget-box p-4" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {hangoutAnnouncements.map((a) => (
                    <AnnouncementNote key={a.id} a={a} noTilt fullWidth />
                  ))}
                </div>
              </div>
            )}

            {/* RSVP */}
            <div>
              <div className="font-pixel text-xs text-[#3A0030] mb-3" style={{ fontSize: '12px' }}>RESERVE YOUR SPOT</div>
              <RSVPButton
                hangoutId={hangout.id}
                maxParticipants={hangout.max_participants}
                confirmedCount={rsvpCount}
                status={hangout.status}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
