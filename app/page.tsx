
import TopMarquee from '@/components/landing/TopMarquee'
import { type FreshScrapbook } from '@/components/landing/FreshScrapbooks'
import Y2KHome, { Y2KShell } from '@/components/landing/y2k/Y2KHome'
import Y2KDashboard from '@/components/landing/y2k/Y2KDashboard'
import type { DashScrapbook } from '@/components/landing/DashboardScrapbooks'
import { createClient } from '@/lib/supabase-server'
import { getLiveAnnouncements } from '@/lib/announcements'
import AnnouncementBoard from '@/components/hangouts/AnnouncementBoard'
import { decodePaper, rowToElement, type NbPage } from '@/lib/notebook'

export default async function Home() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [
    freshResult,
    promptResult,
    exchangeTotalResult,
    exchangeTodayResult,
    announcements,
    userCountResult,
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
    supabase.from('profiles').select('id', { count: 'exact', head: true }).not('username', 'in', '("testuser","test","demo","admin_test","scrappy_admin")'),
  ])

  // Current user
  const { data: { user: authUser } } = await supabase.auth.getUser()
  let currentUser: { username: string; id: string } | null = null
  let isProfilePublic = true
  if (authUser) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, is_public')
      .eq('id', authUser.id)
      .single()
    currentUser = profile ? { username: profile.username, id: authUser.id } : null
    isProfilePublic = profile?.is_public ?? true
  }

  // Logged-in: fetch user's scrapbooks + latest
  let latestScrapbook: { id: string; title: string; cover_id: string } | null = null
  let userScrapbooks: DashScrapbook[] = []
  let rsvpHangoutIds: string[] = []
  const firstPageMap: Record<string, NbPage> = {}

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

    // Fetch actual cover page data for thumbnails
    const sbIds = userScrapbooks.map((s) => s.id)
    if (sbIds.length) {
      const { data: pageRows } = await supabase
        .from('scrapbook_pages')
        .select('id, scrapbook_id, page_number, bg_color, bg_texture')
        .in('scrapbook_id', sbIds)
        .order('page_number', { ascending: true })

      const firstPages: Record<string, { id: string; scrapbook_id: string; bg_color: string | null; bg_texture: string | null }> = {}
      for (const p of (pageRows ?? [])) {
        if (!firstPages[p.scrapbook_id]) firstPages[p.scrapbook_id] = p
      }

      const pageIds = Object.values(firstPages).map((p) => p.id)
      if (pageIds.length) {
        const { data: elRows } = await supabase
          .from('scrapbook_elements')
          .select('id, page_id, type, content, x, y, width, height, rotation, z_index, props')
          .in('page_id', pageIds)

        for (const [sbId, p] of Object.entries(firstPages)) {
          const elements = (elRows ?? [])
            .filter((r) => r.page_id === p.id)
            .map(rowToElement)
            .filter((e): e is NonNullable<typeof e> => !!e)
            .sort((a, b) => a.z - b.z)
          firstPageMap[sbId] = {
            id: p.id,
            ...decodePaper(p.bg_texture ?? null),
            color: p.bg_color || '#FFF8ED',
            elements,
          }
        }
      }
    }
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

  const dateLabel = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())

  return (
    <div className="relative overflow-x-clip">
      <TopMarquee />

      {currentUser ? (
        /* ── Logged-in: dashboard ── */
        <Y2KShell dateLabel={dateLabel} user={currentUser}>
          <Y2KDashboard
            user={currentUser}
            prompt={promptResult.data ?? null}
            latestScrapbook={latestScrapbook}
            scrapbooks={userScrapbooks}
            firstPages={firstPageMap}
            isPublic={isProfilePublic}
            announcementsSlot={announcementsSlot}
          />
        </Y2KShell>
      ) : (
        /* ── Logged-out: lo-fi Y2K homepage ── */
        <Y2KHome
          dateLabel={dateLabel}
          fresh={freshScrapbooks}
          hangoutBoard={announcements.length > 0 ? <AnnouncementBoard announcements={announcements} variant="compact" /> : null}
          prompt={promptResult.data ?? null}
          userCount={userCountResult.count ?? 0}
        />
      )}
    </div>
  )
}
