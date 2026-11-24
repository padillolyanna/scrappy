export const instant = false

import TopMarquee from '@/components/landing/TopMarquee'
import { type FreshScrapbook } from '@/components/landing/FreshScrapbooks'
import HomeDashboard from '@/components/landing/HomeDashboard'
import Y2KHome from '@/components/landing/y2k/Y2KHome'
import type { DashScrapbook } from '@/components/landing/DashboardScrapbooks'
import { createClient } from '@/lib/supabase-server'
import { getLiveAnnouncements } from '@/lib/announcements'
import AnnouncementBoard from '@/components/hangouts/AnnouncementBoard'

export default async function Home() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [
    freshResult,
    promptResult,
    exchangeTotalResult,
    exchangeTodayResult,
    announcements,
  ] = await Promise.all([
    supabase
      .from('scrapbooks')
      .select('id, title, cover_id, profiles!inner(username)')
      .eq('is_public', true)
      .not('profiles.username', 'in', '("testuser","test","demo","admin_test","scrappy_admin")')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase.from('daily_prompts').select('*').eq('date', today).maybeSingle(),
    supabase.from('exchanges').select('id', { count: 'exact', head: true }),
    supabase.from('exchanges').select('id', { count: 'exact', head: true }).gte('created_at', `${today}T00:00:00.000Z`),
    getLiveAnnouncements({ limit: 3 }),
  ])

  // Current user
  const { data: { user: authUser } } = await supabase.auth.getUser()
  let currentUser: { username: string; id: string } | null = null
  if (authUser) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', authUser.id)
      .single()
    currentUser = profile ? { username: profile.username, id: authUser.id } : null
  }

  // Logged-in: fetch user's scrapbooks + latest
  let latestScrapbook: { id: string; title: string; cover_id: string } | null = null
  let userScrapbooks: DashScrapbook[] = []
  let rsvpHangoutIds: string[] = []

  if (currentUser && authUser) {
    const [sbResult, rsvpResult] = await Promise.all([
      supabase
        .from('scrapbooks')
        .select('id, title, cover_id, is_public')
        .eq('user_id', authUser.id)
        .order('updated_at', { ascending: false })
        .limit(50),
      supabase
        .from('hangout_rsvps')
        .select('hangout_id')
        .eq('user_id', authUser.id)
        .eq('status', 'confirmed'),
    ])

    userScrapbooks = (sbResult.data ?? []) as DashScrapbook[]
    if (userScrapbooks.length > 0) {
      const first = userScrapbooks[0]
      latestScrapbook = { id: first.id, title: first.title, cover_id: first.cover_id }
    }
    rsvpHangoutIds = (rsvpResult.data ?? []).map((r: { hangout_id: string }) => r.hangout_id)
  }

  // Marketing page: fresh public scrapbooks
  type FreshRow = { id: string; title: string; cover_id: string; profiles: { username: string } | { username: string }[] | null }
  const freshScrapbooks = (freshResult.data ?? []).map((sb) => {
    const row = sb as unknown as FreshRow
    return {
      id: row.id,
      title: row.title,
      cover_id: row.cover_id,
      profiles: Array.isArray(row.profiles) ? (row.profiles[0] as { username: string }) : (row.profiles as { username: string } | null),
    }
  }) as FreshScrapbook[]

  // Build server-side slot for the logged-in dashboard
  const announcementsSlot = announcements.length > 0
    ? <AnnouncementBoard announcements={announcements} variant="compact" rsvpHangoutIds={rsvpHangoutIds} />
    : null

  return (
    <div className="relative overflow-x-clip">
      <TopMarquee />

      {currentUser ? (
        /* ── Logged-in: dashboard ── */
        <HomeDashboard
          user={currentUser}
          prompt={promptResult.data ?? null}
          latestScrapbook={latestScrapbook}
          scrapbooks={userScrapbooks}
          announcementsSlot={announcementsSlot}
        />
      ) : (
        /* ── Logged-out: lo-fi Y2K homepage ── */
        <Y2KHome
          dateLabel={new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}
          fresh={freshScrapbooks}
          hangoutBoard={announcements.length > 0 ? <AnnouncementBoard announcements={announcements} variant="compact" /> : null}
        />
      )}
    </div>
  )
}
